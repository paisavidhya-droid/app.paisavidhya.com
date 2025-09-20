#!/usr/bin/env bash
# Netlify runs this before building. 
# exit 0 = build, exit 1 = skip build

# On first build or if Netlify has no cached ref, just build
if [ -z "$CACHED_COMMIT_REF" ]; then
  echo "No cached commit ref; building."
  exit 0
fi

# Compare from last cached commit to current commit
CHANGED_FILES=$(git diff --name-only "$CACHED_COMMIT_REF" "$COMMIT_REF")

# Build if anything in client/ changed, or FE-related files
if echo "$CHANGED_FILES" | grep -Eq '^client/|^netlify\.toml$|^client/package\.json$|^client/pnpm-lock\.yaml$|^client/yarn\.lock$|^client/package-lock\.json$'; then
  echo "Client-related changes detected; building."
  exit 0
fi

echo "No client changes (likely server-only); skipping build."
exit 1
