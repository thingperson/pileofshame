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
  {
    rules: {
      // React-Compiler-era rule (eslint-config-next@16) that flags the
      // `useEffect(() => setMounted(true), [])` hydration idiom used all over
      // this codebase. These are not bugs — the effect is deliberately
      // deferring a client-only value past hydration. Downgraded to a warning
      // so the CI lint gate stays green while the pattern remains visible.
      // Genuine hook bugs (stale-closure memoization, impure render) are still
      // errors and are fixed at the source. See docs/specs/lint-hook-errors.md.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
