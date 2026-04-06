#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/apps/web/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

required_vars=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  CRON_SECRET
)

for name in "${required_vars[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "Missing value for $name in $ENV_FILE"
    exit 1
  fi
done

apply_var() {
  local name="$1"
  local value="$2"
  local target="$3"
  local git_branch="${4:-}"

  if [[ -n "$git_branch" ]]; then
    npx vercel env rm "$name" "$target" "$git_branch" --yes >/dev/null 2>&1 || true
    printf '%s' "$value" | npx vercel env add "$name" "$target" "$git_branch"
  else
    npx vercel env rm "$name" "$target" --yes >/dev/null 2>&1 || true
    printf '%s' "$value" | npx vercel env add "$name" "$target"
  fi
}

ensure_linked() {
  if [[ ! -f "$ROOT_DIR/.vercel/project.json" ]]; then
    echo "Vercel project not linked yet. Starting link..."
    npx vercel link --yes
  fi
}

verify_env_target() {
  local target="$1"
  local output
  output="$(npx vercel env ls "$target" 2>/dev/null || true)"

   if [[ "$target" == "preview" ]] && printf '%s' "$output" | grep -q "No Environment Variables found"; then
    echo "Warning: preview env validation skipped (likely no connected Git repository in Vercel project)."
    return 0
  fi

  for name in "${required_vars[@]}"; do
    if ! printf '%s' "$output" | grep -q "$name"; then
      echo "Missing $name in Vercel environment: $target"
      exit 1
    fi
  done
}

ensure_linked

for target in production preview development; do
  if [[ "$target" == "preview" ]]; then
    preview_branch="${VERCEL_PREVIEW_GIT_BRANCH:-main}"
    set +e
    apply_var "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL" "$target" "$preview_branch"
    apply_var "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" "$target" "$preview_branch"
    apply_var "SUPABASE_URL" "$SUPABASE_URL" "$target" "$preview_branch"
    apply_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY" "$target" "$preview_branch"
    apply_var "CRON_SECRET" "$CRON_SECRET" "$target" "$preview_branch"
    preview_exit_code=$?
    set -e

    if [[ $preview_exit_code -ne 0 ]]; then
      echo "Warning: could not apply preview env vars non-interactively (missing Vercel Git integration)."
    fi
  else
    apply_var "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL" "$target"
    apply_var "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" "$target"
    apply_var "SUPABASE_URL" "$SUPABASE_URL" "$target"
    apply_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY" "$target"
    apply_var "CRON_SECRET" "$CRON_SECRET" "$target"
  fi
  verify_env_target "$target"
done

echo "Vercel env variables applied for production/preview/development."
