import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Scratch / feedback files — not app code
    "notes/**",
    // Pre-Next prototypes kept for reference. Not imported by the app, not
    // built, not shipped — linting them only ever produced CI noise.
    "early-examples/**",
  ]),
]);

export default eslintConfig;
