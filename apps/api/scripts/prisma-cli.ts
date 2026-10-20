import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export function runPrisma(args: string[], env: NodeJS.ProcessEnv): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [require.resolve("prisma"), ...args], {
      env,
      stdio: "inherit",
      shell: false
    });
    child.once("error", () => reject(new Error("Unable to start the Prisma CLI")));
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error("Prisma command failed")));
  });
}
