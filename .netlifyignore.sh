#!/usr/bin/env bash
# Netlify ignore: exit 0 = SKIP build, non-zero = RUN build

# If Netlify has no cached base commit, FORCE a build
if [ -z "$CACHED_COMMIT_REF" ]; then
  echo "No cached commit ref; forcing build."
  exit 1
fi

CHANGED_FILES="$(git diff --name-only "$CACHED_COMMIT_REF" "$COMMIT_REF")"

# If frontend changed → RUN build (exit 1)
if echo "$CHANGED_FILES" | grep -Eq '^client/|^client/netlify\.toml$|^client/package\.json$|^client/(pnpm-lock\.yaml|yarn\.lock|package-lock\.json)$'; then
  echo "Client-related changes detected; building."
  exit 1
fi

# Otherwise SKIP
echo "No client changes detected (likely server-only). Skipping build."
exit 0
