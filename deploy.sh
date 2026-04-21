#!/usr/bin/env bash
# deploy.sh — Safe auto-deploy for SecretLeaf (Next.js + Vercel)
# Usage: ./deploy.sh
#
# Flow:
#   1. Pre-checks  (git repo, branch = main)
#   2. Stage & check  (git add -A, any changes?)
#   3. Temp commit  (reversible)
#   4. Full validation  (tsc --noEmit + next build) → rollback on failure
#   5. Push  (with one retry)
#   6. Done

# Do NOT use set -e — we handle every failure explicitly so nothing is silent.
set -uo pipefail

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

info()    { echo -e "${CYAN}▸ $*${RESET}"; }
success() { echo -e "${GREEN}✅ $*${RESET}"; }
warn()    { echo -e "${YELLOW}⚠  $*${RESET}"; }
error()   { echo -e "${RED}✗  $*${RESET}" >&2; }
header()  { echo -e "\n${BOLD}── $* ──${RESET}"; }

# ── Step 1 — Pre-checks ───────────────────────────────────────────────────────
header "Step 1 / 5  Pre-checks"

if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  error "Not inside a git repository."
  exit 1
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "${CURRENT_BRANCH}" != "main" ]]; then
  error "Branch is '${CURRENT_BRANCH}' — expected 'main'."
  warn  "Run: git checkout main"
  exit 1
fi
success "Inside git repo, branch = main"

REPO_ROOT=$(git rev-parse --show-toplevel)

# ── Version — read current (or init at 1) ────────────────────────────────────
VERSION_FILE="${REPO_ROOT}/version.txt"
if [[ ! -f "${VERSION_FILE}" ]]; then
  echo "1" > "${VERSION_FILE}"
fi
CURRENT_VERSION=$(cat "${VERSION_FILE}" | tr -d '[:space:]')
if ! [[ "${CURRENT_VERSION}" =~ ^[0-9]+$ ]]; then
  warn "version.txt contains '${CURRENT_VERSION}' — resetting to 1."
  CURRENT_VERSION=1
fi
NEXT_VERSION=$(( CURRENT_VERSION + 1 ))
info "Current version: v${CURRENT_VERSION}  →  next: v${NEXT_VERSION}"

# ── Step 2 — Stage & check ────────────────────────────────────────────────────
header "Step 2 / 5  Staging"
git add -A

if git diff --cached --quiet; then
  success "No changes to deploy."
  exit 0
fi

# Capture changed files before commit (used for commit message + log)
CHANGED_FILES_ALL=$(git diff --cached --name-only)
CHANGED_COUNT=$(echo "${CHANGED_FILES_ALL}" | wc -l | tr -d ' ')

# Build display list (max 5 files)
CHANGED_FILES_SHORT=$(echo "${CHANGED_FILES_ALL}" | head -5 | paste -sd ', ')
if [[ "${CHANGED_COUNT}" -gt 5 ]]; then
  REMAINING=$(( CHANGED_COUNT - 5 ))
  CHANGED_FILES_SHORT="${CHANGED_FILES_SHORT}, +${REMAINING} more"
fi

info "Changed files (${CHANGED_COUNT}):"
echo "${CHANGED_FILES_ALL}" | sed 's/^/        /'

# ── Step 3 — Temp commit (reversible) ────────────────────────────────────────
header "Step 3 / 5  Committing"
TIMESTAMP=$(date -u '+%Y-%m-%d %H:%M UTC')
COMMIT_MSG="deploy v${NEXT_VERSION}: ${CHANGED_FILES_SHORT}"

if ! git commit -m "${COMMIT_MSG}"; then
  error "Commit failed — nothing staged."
  git reset HEAD 2>/dev/null || true
  exit 1
fi
success "Committed: \"${COMMIT_MSG}\""

# ── Step 4 — Full validation ──────────────────────────────────────────────────
header "Step 4 / 5  Validating"

VALIDATION_FAILED=0

# 4a — TypeScript
info "TypeScript check (tsc --noEmit)…"
if npm run typecheck --workspace @secretleaf/web; then
  success "TypeScript — no errors"
else
  error "TypeScript check failed."
  VALIDATION_FAILED=1
fi

# 4b — Next.js build (only if tsc passed, avoids double noise)
if [[ ${VALIDATION_FAILED} -eq 0 ]]; then
  info "Next.js build (npm run build)…"
  if npm run build --workspace @secretleaf/web; then
    success "Build passed"
  else
    error "Next.js build failed."
    VALIDATION_FAILED=1
  fi
fi

# Rollback if either check failed
if [[ ${VALIDATION_FAILED} -ne 0 ]]; then
  warn "Rolling back local commit…"
  git reset --soft HEAD~1
  # Log failed attempt (version not bumped)
  DEPLOY_LOG="${REPO_ROOT}/deploy-log.txt"
  {
    echo "[${TIMESTAMP}]"
    echo "Version: v${NEXT_VERSION} (not applied)"
    echo "Files: ${CHANGED_FILES_SHORT}"
    echo "Status: failed (build error)"
    echo ""
  } >> "${DEPLOY_LOG}"
  echo ""
  error "Build failed — nothing pushed."
  warn  "Fix the errors above and re-run ./deploy.sh"
  exit 1
fi

# ── Step 5 — Push ─────────────────────────────────────────────────────────────
header "Step 5 / 5  Pushing"

do_push() {
  git push origin main --no-progress 2>&1
}

if do_push; then
  success "Pushed to main"
else
  warn "Push failed — retrying once…"
  sleep 3
  if do_push; then
    success "Pushed to main (retry succeeded)"
  else
    echo ""
    error "Push failed after retry."
    warn  "Your commit exists locally but was NOT pushed."
    warn  "Fix the remote issue (e.g. git pull --rebase origin main) and re-run."
    exit 1
  fi
fi

# ── Bump version ─────────────────────────────────────────────────────────────
echo "${NEXT_VERSION}" > "${VERSION_FILE}"
success "Version bumped to v${NEXT_VERSION}"

# ── Log success ───────────────────────────────────────────────────────────────
DEPLOY_LOG="${REPO_ROOT}/deploy-log.txt"
{
  echo "[${TIMESTAMP}]"
  echo "Version: v${NEXT_VERSION}"
  echo "Files: ${CHANGED_FILES_SHORT}"
  echo "Status: success"
  echo ""
} >> "${DEPLOY_LOG}"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}✅ Committed${RESET}"
echo -e "${GREEN}${BOLD}✅ Build passed${RESET}"
echo -e "${GREEN}${BOLD}🚀 Pushed to main${RESET}"
echo -e "${CYAN}${BOLD}🌐 Vercel deployment starting...${RESET}"
echo ""
echo -e "${GREEN}${BOLD}🚀 Deployed v${NEXT_VERSION}${RESET}"
echo ""
echo -e "${BOLD}Deployed changes:${RESET}"
echo "${CHANGED_FILES_ALL}" | head -5 | sed 's/^/  • /'
if [[ "${CHANGED_COUNT}" -gt 5 ]]; then
  echo -e "  ${YELLOW}… and $(( CHANGED_COUNT - 5 )) more (see deploy-log.txt)${RESET}"
fi
echo ""
