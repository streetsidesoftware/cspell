#!/bin/bash

## Delete old cache keys from GitHub Actions.

gh extension install actions/gh-actions-cache

echo "Fetching list of cache key"
cacheKeysForPR=$(gh actions-cache list --order asc --sort last-used  -L 100 | cut -f 1 )

## Setting this to not fail the workflow while deleting cache keys.
set +e
echo "Deleting caches..."
for cacheKey in $cacheKeysForPR
do
    gh actions-cache delete $cacheKey  --confirm
done
echo "Done"
