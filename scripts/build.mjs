import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");

const exitCode = await new Promise((resolveExit) => {
  const child = spawn(
    process.execPath,
    [
      "-e",
      "import { build } from 'vite'; build({ logLevel: 'info' }).then(() => process.exit(0), (err) => { console.error(err); process.exit(1); })",
    ],
    {
      env: {
        ...process.env,
        NODE_OPTIONS: "--max-old-space-size=4096",
      },
      cwd: resolve(__dirname, ".."),
      stdio: ["ignore", "inherit", "inherit"],
    },
  );

  child.on("exit", (code) => resolveExit(code ?? 1));
  child.on("error", () => resolveExit(1));
});

process.exit(exitCode);
