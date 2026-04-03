import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const currentFile = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(currentFile), "..", "..");
const schemaPath = path.join(repoRoot, "prisma", "schema.prisma");
describe("prisma schema", () => {
  it("defines the required models and validates successfully", () => {
    const schema = fs.readFileSync(schemaPath, "utf8");

    expect(schema).toContain("model User");
    expect(schema).toContain("model Wallet");
    expect(schema).toContain("model Recipient");
    expect(schema).toContain("model Transfer");
    expect(schema).toContain("model RailQuery");
    expect(schema).toContain("model AgentLog");
    expect(schema).toContain('sentTransfers          Transfer[]             @relation("TransferSender")');
    expect(schema).toContain('receivedTransfers Transfer[]      @relation("TransferRecipient")');
    expect(schema).toContain('railQueries        RailQuery[]');
    expect(schema).toContain('agentLogs          AgentLog[]');

    const env = {
      ...process.env,
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://postgres:postgres@localhost:5432/kova?schema=public",
    };
    const output = execSync("pnpm exec prisma validate", {
      cwd: repoRoot,
      env,
      encoding: "utf8",
      shell: true,
    });

    expect(output).toContain("schema");
    expect(output.toLowerCase()).toContain("is valid");
  }, 15000);
});
