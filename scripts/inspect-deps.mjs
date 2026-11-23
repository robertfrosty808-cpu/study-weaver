import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkgPath = resolve(__dirname, "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };

const omit = new Set([
  "react",
  "react-dom",
  "react-router",
  "convex",
  "@radix-ui/react-accordion",
  "@radix-ui/react-alert-dialog",
  "@radix-ui/react-avatar",
  "@radix-ui/react-checkbox",
  "@radix-ui/react-collapsible",
  "@radix-ui/react-context-menu",
  "@radix-ui/react-dialog",
  "@radix-ui/react-dropdown-menu",
  "@radix-ui/react-hover-card",
  "@radix-ui/react-label",
  "@radix-ui/react-menubar",
  "@radix-ui/react-navigation-menu",
  "@radix-ui/react-popover",
  "@radix-ui/react-progress",
  "@radix-ui/react-radio-group",
  "@radix-ui/react-scroll-area",
  "@radix-ui/react-select",
  "@radix-ui/react-separator",
  "@radix-ui/react-slider",
  "@radix-ui/react-switch",
  "@radix-ui/react-tabs",
  "@radix-ui/react-toggle",
  "@radix-ui/react-toggle-group",
  "@radix-ui/react-tooltip",
]);

const left = Object.keys(deps).filter((k) => !omit.has(k));
console.log("remaining direct deps:", left.length);
left.slice(0, 120).forEach((k) => console.log(" -", k, "@", deps[k]));
