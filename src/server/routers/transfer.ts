import { TransferStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { executeTransfer, prepareTransfer } from "@/lib/agent/executor";
import { IntentParseError, parseTransferIntent } from "@/lib/agent/intent-parser";
import { getAttestationByHashFromChain } from "@/lib/kite/attestation";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/trpc";

const parsedIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(3),
  country: z.string().min(2),
  recipientHint: z.string().nullable(),
});

async function resolveCurrentUserId(ctx: {
  db: typeof import("@/server/db").db;
  session: NonNullable<
    Awaited<ReturnType<typeof import("@/server/trpc").createTRPCContext>>["session"]
  >;
}) {
  const email = ctx.session.user.email;
  if (!email) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "A verified email address is required to continue.",
    });
  }

  const user = await ctx.db.user.upsert({
    where: {
      email,
    },
    update: {},
    create: {
      email,
    },
  });

  return user.id;
}

function parsedIntentFromTransfer(transfer: {
  amountUsd: { toString(): string };
  recipient: {
    country: string;
    name: string;
  };
}) {
  return {
    amount: Number(transfer.amountUsd.toString()),
    currency: "USD",
    country: transfer.recipient.country,
    recipientHint: transfer.recipient.name,
  };
}

export const transferRouter = createTRPCRouter({
  parseIntent: protectedProcedure
    .input(
      z.object({
        rawText: z.string().trim().min(3),
      }),
    )
    .query(({ input }) => {
      try {
        return parseTransferIntent(input.rawText);
      } catch (error) {
        if (error instanceof IntentParseError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
            cause: {
              code: error.code,
              field: error.field,
            },
          });
        }

        throw error;
      }
    }),
  previewTransfer: protectedProcedure
    .input(
      z.object({
        parsedIntent: parsedIntentSchema,
        recipientId: z.string().cuid(),
        rawText: z.string().trim().min(3).optional(),
        requireConfirmationAbove: z.number().positive().default(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = await resolveCurrentUserId({
        db: ctx.db,
        session: ctx.session,
      });

      return prepareTransfer({
        userId,
        intentResult: input.parsedIntent,
        recipientId: input.recipientId,
        requireConfirmationAbove: input.requireConfirmationAbove,
        rawText: input.rawText,
      });
    }),
  executeTransfer: protectedProcedure
    .input(
      z
        .object({
          transferId: z.string().cuid().optional(),
          parsedIntent: parsedIntentSchema.optional(),
          recipientId: z.string().cuid().optional(),
          rawText: z.string().trim().min(3).optional(),
          requireConfirmationAbove: z.number().positive().default(500),
        })
        .refine(
          (value) =>
            Boolean(value.transferId) ||
            Boolean(value.parsedIntent && value.recipientId),
          {
            message:
              "Provide either an existing transferId or a parsed intent with recipientId.",
            path: ["transferId"],
          },
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = await resolveCurrentUserId({
        db: ctx.db,
        session: ctx.session,
      });

      if (input.transferId) {
        const transfer = await ctx.db.transfer.findUnique({
          where: {
            id: input.transferId,
          },
          include: {
            recipient: true,
          },
        });

        if (!transfer || transfer.senderId !== userId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Transfer not found for this user.",
          });
        }

        return executeTransfer({
          userId,
          transferId: transfer.id,
          recipientId: transfer.recipientId,
          intentResult: parsedIntentFromTransfer(transfer),
          requireConfirmationAbove: input.requireConfirmationAbove,
          rawText: input.rawText,
        });
      }

      return executeTransfer({
        userId,
        recipientId: input.recipientId!,
        intentResult: input.parsedIntent!,
        requireConfirmationAbove: input.requireConfirmationAbove,
        rawText: input.rawText,
      });
    }),
  confirmTransfer: protectedProcedure
    .input(
      z.object({
        transferId: z.string().cuid(),
        requireConfirmationAbove: z.number().positive().default(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = await resolveCurrentUserId({
        db: ctx.db,
        session: ctx.session,
      });
      const transfer = await ctx.db.transfer.findUnique({
        where: {
          id: input.transferId,
        },
        include: {
          recipient: true,
        },
      });

      if (!transfer || transfer.senderId !== userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transfer not found for this user.",
        });
      }

      return executeTransfer({
        userId,
        transferId: transfer.id,
        recipientId: transfer.recipientId,
        intentResult: parsedIntentFromTransfer(transfer),
        requireConfirmationAbove: input.requireConfirmationAbove,
        skipConfirmation: true,
      });
    }),
  getHistory: protectedProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().max(50).default(10),
        status: z.nativeEnum(TransferStatus).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = await resolveCurrentUserId({
        db: ctx.db,
        session: ctx.session,
      });

      const where = {
        senderId: userId,
        ...(input.status ? { status: input.status } : {}),
      };

      const [items, total] = await Promise.all([
        ctx.db.transfer.findMany({
          where,
          include: {
            recipient: true,
            railQueries: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: input.pageSize,
          skip: (input.page - 1) * input.pageSize,
        }),
        ctx.db.transfer.count({
          where,
        }),
      ]);

      return {
        page: input.page,
        pageSize: input.pageSize,
        total,
        items: items.map((item) => ({
          ...item,
          amountUsd: Number(item.amountUsd.toString()),
          feeUsd: Number(item.feeUsd.toString()),
          savingsUsd: Number(item.savingsUsd.toString()),
          netDeliveryUsd: Number(item.netDeliveryUsd.toString()),
          createdAt: item.createdAt.toISOString(),
          completedAt: item.completedAt?.toISOString() ?? null,
          railQueries: item.railQueries.map((query) => ({
            ...query,
            feeUsd: Number(query.feeUsd.toString()),
            rate: Number(query.rate.toString()),
            queriedAt: query.queriedAt.toISOString(),
          })),
        })),
      };
    }),
  getAttestation: publicProcedure
    .input(
      z.object({
        attestationHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
      }),
    )
    .query(async ({ input }) => {
      const attestation = await getAttestationByHashFromChain(input.attestationHash);
      if (!attestation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attestation not found on Kite chain.",
        });
      }

      return attestation;
    }),
});
