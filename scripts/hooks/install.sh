#!/usr/bin/env bash
#
# Install repo-tracked git hooks into .git/hooks/
# Run from repo root: bash scripts/hooks/install.sh
#
# Why this script exists: .git/hooks/ isn't tracked, so we keep the canonical
# hooks under scripts/hooks/ and copy them in. Re-run after a fresh clone.

set -e

repo_root="$(git rev-parse --show-toplevel)"
src_dir="$repo_root/scripts/hooks"
dst_dir="$repo_root/.git/hooks"

if [ ! -d "$src_dir" ]; then
  echo "error: $src_dir not found"
  exit 1
fi

for hook in pre-push; do
  if [ -f "$src_dir/$hook" ]; then
    cp "$src_dir/$hook" "$dst_dir/$hook"
    chmod +x "$dst_dir/$hook"
    echo "installed: $hook"
  fi
done

echo ""
echo "Hooks installed. Test with: git push --dry-run"
