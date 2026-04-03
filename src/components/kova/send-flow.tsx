"use client";

import { startTransition, useMemo, useState } from "react";
import Link from "next/link";
import { RailName } from "@prisma/client";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  LoaderCircle,
  Sparkles,
  Wallet2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  demoRecipients,
  demoTransfers,
  formatCurrency,
  routeMatrix,
  sendExamples,
} from "@/lib/demo-data";
import { parseTransferIntent } from "@/lib/agent/intent-parser";
import { cn } from "@/lib/utils";

type SendStep =
  | "intent"
  | "recipient"
  | "routes"
  | "confirm"
  | "executing"
  | "success";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function SendFlow() {
  const [step, setStep] = useState<SendStep>("intent");
  const [intentText, setIntentText] = useState("Send $150 to Nigeria");
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedIntent, setParsedIntent] = useState<{
    amount: number;
    currency: string;
    country: string;
    recipientHint: string | null;
  } | null>(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState(
    demoRecipients[0]?.id ?? "",
  );
  const [saveRecipient, setSaveRecipient] = useState(true);
  const [isRouting, setIsRouting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [routeIndex, setRouteIndex] = useState(0);
  const [executionIndex, setExecutionIndex] = useState(0);

  const selectedRecipient =
    demoRecipients.find((recipient) => recipient.id === selectedRecipientId) ??
    demoRecipients[0];
  const selectedRoute =
    routeMatrix.find((route) => route.railName === RailName.KITE_NATIVE) ??
    routeMatrix[0];
  const successTransfer = demoTransfers[0];

  const displayedRoutes = useMemo(
    () => routeMatrix.slice(0, Math.max(1, routeIndex)),
    [routeIndex],
  );

  async function handleParse() {
    setParseError(null);
    startTransition(() => {
      try {
        const parsed = parseTransferIntent(intentText);
        setParsedIntent(parsed);
        setStep("recipient");
      } catch (error) {
        setParseError(
          error instanceof Error ? error.message : "Kova could not parse that request.",
        );
      }
    });
  }

  async function handleRouteQuery() {
    setStep("routes");
    setIsRouting(true);
    setRouteIndex(1);
    for (let index = 2; index <= routeMatrix.length; index += 1) {
      await sleep(320);
      setRouteIndex(index);
    }
    setIsRouting(false);
  }

  async function handleExecute() {
    const requiresConfirmation = (parsedIntent?.amount ?? 0) > 500;
    if (requiresConfirmation && step !== "confirm") {
      setStep("confirm");
      return;
    }

    setStep("executing");
    setIsExecuting(true);
    setExecutionIndex(0);
    for (let index = 1; index <= 6; index += 1) {
      await sleep(360);
      setExecutionIndex(index);
    }
    setIsExecuting(false);
    setStep("success");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <Card className="rounded-[28px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardHeader className="px-6 pt-6">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
              Step 1 — Intent input
            </p>
            <CardTitle className="mt-2 text-2xl font-semibold text-slate-950">
              What do you want to send?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <Textarea
              value={intentText}
              onChange={(event) => setIntentText(event.target.value)}
              className="min-h-[140px] rounded-[24px] border-slate-200 bg-slate-50 px-5 py-4 text-base"
              placeholder="Send $200 to Lagos..."
            />
            <div className="flex flex-wrap gap-2">
              {sendExamples.map((example) => (
                <button
                  key={example}
                  onClick={() => setIntentText(example)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  {example}
                </button>
              ))}
            </div>
            {parseError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {parseError}
              </div>
            ) : null}
            {parsedIntent ? (
              <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                Parsed result: Send {formatCurrency(parsedIntent.amount)}{" "}
                {parsedIntent.currency} to {parsedIntent.country}
              </div>
            ) : null}
            <Button
              size="lg"
              className="h-12 rounded-2xl px-5"
              onClick={handleParse}
            >
              Parse intent
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>

        {step !== "intent" ? (
          <Card className="rounded-[28px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <CardHeader className="px-6 pt-6">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
                Step 2 — Recipient
              </p>
              <CardTitle className="mt-2 text-2xl font-semibold text-slate-950">
                Choose who receives the money.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="grid gap-3 md:grid-cols-3">
                {demoRecipients.map((recipient) => {
                  const active = recipient.id === selectedRecipientId;
                  return (
                    <button
                      key={recipient.id}
                      onClick={() => setSelectedRecipientId(recipient.id)}
                      className={cn(
                        "rounded-[24px] border p-4 text-left transition",
                        active
                          ? "border-[#0C82DD] bg-sky-50 shadow-[0_10px_30px_rgba(12,130,221,0.10)]"
                          : "border-slate-200 bg-white hover:border-slate-300",
                      )}
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {recipient.countryCode}
                      </p>
                      <p className="mt-2 font-semibold text-slate-950">
                        {recipient.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {recipient.country} • {recipient.method.replace("_", " ")}
                      </p>
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <Input
                    defaultValue={selectedRecipient.name}
                    className="rounded-2xl border-slate-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Phone
                  </label>
                  <Input
                    defaultValue={selectedRecipient.phone}
                    className="rounded-2xl border-slate-200 bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <Checkbox
                  checked={saveRecipient}
                  onCheckedChange={(checked) => setSaveRecipient(Boolean(checked))}
                />
                <span className="text-sm text-slate-600">Save for future</span>
              </div>
              <Button
                size="lg"
                className="h-12 rounded-2xl px-5"
                onClick={handleRouteQuery}
              >
                Let Kova compare rails
                <Sparkles className="size-4" />
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {step === "routes" || step === "confirm" || step === "executing" || step === "success" ? (
          <Card className="rounded-[28px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <CardHeader className="px-6 pt-6">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
                Step 3 — Route selection
              </p>
              <CardTitle className="mt-2 text-2xl font-semibold text-slate-950">
                Agent is negotiating...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              {isRouting ? (
                <div className="grid gap-3">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-20 rounded-[24px]" />
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-[24px] border border-slate-200">
                  <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.6fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <span>Rail</span>
                    <span>Fee</span>
                    <span>Delivery</span>
                    <span>Score</span>
                  </div>
                  {displayedRoutes.map((route) => (
                    <div
                      key={route.railName}
                      className={cn(
                        "grid grid-cols-[1.4fr_0.8fr_0.8fr_0.6fr] gap-3 border-t border-slate-100 px-4 py-4 text-sm",
                        route.railName === selectedRoute.railName
                          ? "bg-sky-50"
                          : "bg-white",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-950">
                          {route.label}
                        </span>
                        {route.simulated ? (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                            Simulated
                          </span>
                        ) : null}
                        {route.railName === selectedRoute.railName ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                            Selected
                          </span>
                        ) : null}
                      </div>
                      <span className="text-slate-600">
                        {formatCurrency(route.feeUsd)} ({route.feePercent}%)
                      </span>
                      <span className="text-slate-600">{route.eta}</span>
                      <span className="font-semibold text-slate-950">
                        {"★".repeat(Math.max(1, Math.round(route.score * 5)))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {!isRouting ? (
                <>
                  <div className="rounded-[24px] border border-sky-200 bg-sky-50 px-5 py-4 text-sm leading-6 text-sky-800">
                    Agent selected this route because it is the cheapest and fastest
                    available option for this transfer.
                  </div>
                  {step === "confirm" ? (
                    <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white">
                      <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
                        Step 4 — Confirmation required
                      </p>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-slate-400">Sending</p>
                          <p className="mt-1 text-2xl font-semibold">
                            {formatCurrency(parsedIntent?.amount ?? 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Net delivery</p>
                          <p className="mt-1 text-2xl font-semibold">
                            {formatCurrency(
                              Math.max(
                                0,
                                (parsedIntent?.amount ?? 0) - selectedRoute.feeUsd,
                              ),
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button
                          size="lg"
                          className="h-11 rounded-2xl bg-white px-5 text-slate-950 hover:bg-slate-100"
                          onClick={handleExecute}
                        >
                          Confirm & Send
                        </Button>
                        <Button
                          variant="ghost"
                          size="lg"
                          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white"
                          onClick={() => setStep("routes")}
                        >
                          Change route
                        </Button>
                      </div>
                    </div>
                  ) : step === "routes" ? (
                    <Button
                      size="lg"
                      className="h-12 rounded-2xl px-5"
                      onClick={handleExecute}
                    >
                      Proceed with agent choice
                      <ArrowRight className="size-4" />
                    </Button>
                  ) : null}
                </>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="space-y-6">
        <Card className="rounded-[28px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardHeader className="px-6 pt-6">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
              Live preview
            </p>
            <CardTitle className="mt-2 text-2xl font-semibold text-slate-950">
              Transfer summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6">
            <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(145deg,#07111f_0%,#11284f_48%,#0a1831_100%)] p-5 text-white">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-300">
                Recipient
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {selectedRecipient.name}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {selectedRecipient.country} • {selectedRecipient.phone}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Amount</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatCurrency(parsedIntent?.amount ?? 150)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Estimated savings</p>
                <p className="mt-2 text-xl font-semibold text-emerald-600">
                  {formatCurrency(successTransfer.savedUsd)}
                </p>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Agent Passport</p>
                  <p className="mt-2 font-semibold text-slate-950">
                    0x7E71...8510
                  </p>
                </div>
                <button className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900">
                  <Copy className="size-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {(step === "executing" || step === "success") && (
          <Card className="rounded-[28px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <CardHeader className="px-6 pt-6">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
                Step 5 — Executing
              </p>
              <CardTitle className="mt-2 text-2xl font-semibold text-slate-950">
                Kova is moving the transfer.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-6 pb-6">
              {[
                "Intent parsed",
                "Rails queried (x402 payments made)",
                "Best route selected",
                "Executing transfer...",
                "Writing to Kite chain...",
                "Notifying recipient...",
              ].map((label, index) => {
                const done = executionIndex > index;
                const current = executionIndex === index && isExecuting;

                return (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    {done ? (
                      <CheckCircle2 className="size-5 text-emerald-500" />
                    ) : current ? (
                      <LoaderCircle className="size-5 animate-spin text-[#0C82DD]" />
                    ) : (
                      <div className="size-5 rounded-full border border-slate-300" />
                    )}
                    <span className="text-sm text-slate-700">{label}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {step === "success" && (
          <Card className="rounded-[28px] border border-emerald-200 bg-[linear-gradient(180deg,#f7fff8_0%,#ecfff0_100%)] shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <CardContent className="px-6 py-6">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-7" />
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
                {formatCurrency(successTransfer.netDeliveryUsd)} delivered to{" "}
                {selectedRecipient.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                You saved {formatCurrency(successTransfer.savedUsd)} versus a
                traditional remittance provider.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="h-11 rounded-2xl px-5"
                  render={
                    <Link href={`/attestation/${successTransfer.attestationHash}`} />
                  }
                >
                  View proof on Kite
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 rounded-2xl px-5"
                  onClick={() => {
                    setStep("intent");
                    setParsedIntent(null);
                    setExecutionIndex(0);
                    setRouteIndex(0);
                  }}
                >
                  Send another
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-11 rounded-2xl px-5"
                  render={<Link href="/dashboard" />}
                >
                  Back to dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-[28px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardHeader className="px-6 pt-6">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
              Funding
            </p>
            <CardTitle className="mt-2 text-2xl font-semibold text-slate-950">
              Wallet readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Wallet2 className="size-5 text-[#0C82DD]" />
                <div>
                  <p className="font-semibold text-slate-950">
                    Deposit address ready
                  </p>
                  <p className="text-sm text-slate-500">
                    0x7E71A6dC8A68d86F5b4e993A0dA5a6714aC98510
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Kova will use the funded Kite passport wallet to execute native USDC
              transfers and then write the decision trail on-chain.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
