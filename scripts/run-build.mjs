import { build } from "vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
process.chdir(resolve(__dirname, ".."));

console.log("Vite production build starting");
await build({ logLevel: "info" });
console.log("Vite production build complete");
