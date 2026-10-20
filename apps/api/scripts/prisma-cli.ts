import { spawn } from "node:child_process";

/** Invoke the workspace-local Prisma binary, not a package export path.
 * Prisma 7's package exports do not expose a stable require.resolve("prisma") entry.
 */
export function runPrisma(args: string[], env: NodeJS.ProcessEnv): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
    const child = spawn(command, ["exec", "prisma", ...args], {
      env,
      stdio: "inherit",
      shell: false
    });
    child.once("error", () => reject(new Error("Unable to start the workspace Prisma CLI")));
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error("Prisma command failed")));
  });
}
