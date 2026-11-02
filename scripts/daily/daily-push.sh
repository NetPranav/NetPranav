#!/bin/bash
# Renders today's profile design and pushes it. Safe to run any number of times a day:
# it exits early if today's image is already committed (e.g. by the GitHub Action).
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
cd "$REPO" || exit 1
log() { echo "[$(date '+%F %T')] $*"; }

# At login the network may not be up yet: wait up to 3 minutes.
for _ in $(seq 1 36); do
  curl -sf -m 5 -o /dev/null https://api.github.com && break
  sleep 5
done

[ -n "${PAT_TOKEN:-}" ] || export PAT_TOKEN="$(gh auth token 2>/dev/null)"

git pull --rebase --autostash -q || { log "pull failed"; exit 1; }

TODAY="$(date -u +%F)"
if ls generated/daily/"$TODAY"-*.webp >/dev/null 2>&1; then
  log "$TODAY already rendered, nothing to do"; exit 0
fi

node scripts/daily/render.js || { log "render failed"; exit 1; }

git add README.md generated/daily
if git diff --cached --quiet; then log "no changes"; exit 0; fi
git commit -q -m "Daily profile update $TODAY [skip ci]" || exit 1

for try in 1 2 3; do
  git push -q && { log "pushed $TODAY"; exit 0; }
  git pull --rebase -q -X theirs || git rebase --abort
  sleep 5
done
log "push failed"; exit 1
