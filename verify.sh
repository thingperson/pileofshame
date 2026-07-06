#!/bin/bash
# verify.sh — executable definition-of-done for the Inventory Full web repo.
# Ported from inventoryfull-ios's EDD gate (Fable audit, 2026-07-06).
# Usage:
#   ./verify.sh          # fast gate: lint + typecheck + build
#   ./verify.sh --full   # fast gate + Playwright e2e smoke (needs browsers installed)
#
# Agents: loop on this ("run verify.sh, fix, re-run") until you see GATE PASSED.
# Do not report a task complete without it. Do not pipe this script through
# anything that masks exit codes (the `| tail` gotcha — see iOS HARNESS.md).

set -euo pipefail
cd "$(dirname "$0")"

step() { printf '\n\033[1m== %s ==\033[0m\n' "$1"; }

step "lint"
npm run lint

step "typecheck"
npx tsc --noEmit

step "build"
npm run build

if [[ "${1:-}" == "--full" ]]; then
  step "e2e smoke"
  npx playwright test e2e/smoke.spec.ts
fi

printf '\n\033[1;32mGATE PASSED\033[0m\n'
