#!/usr/bin/env bash
set -euo pipefail

# ENV vars:
# SOURCE_TYPE=bundle|archive|git
# BUNDLE_PATH=/path/or/url/to/terpira-export.bundle
# ARCHIVE_PATH=/path/or/url/to/terpira-export.tar.gz
# REPO_URL=https://...
# TARGET_DIR=/workspaces/SecretLeaf/apps/web
# IMPORT_BRANCH=import-terpira (optional)
# OVERWRITE=false|true (default false)
# ENABLE_COMMIT=false|true (default false)

SOURCE_TYPE="${SOURCE_TYPE:-}"
BUNDLE_PATH="${BUNDLE_PATH:-}"
ARCHIVE_PATH="${ARCHIVE_PATH:-}"
REPO_URL="${REPO_URL:-}"
REPO_REF="${REPO_REF:-}"
TARGET_DIR="${TARGET_DIR:-}"
IMPORT_BRANCH="${IMPORT_BRANCH:-}"
OVERWRITE="${OVERWRITE:-false}"
ENABLE_COMMIT="${ENABLE_COMMIT:-false}"

if [[ -z "$SOURCE_TYPE" || -z "$TARGET_DIR" ]]; then
  echo "Fehler: SOURCE_TYPE und TARGET_DIR sind erforderlich." >&2
  exit 2
fi

WORK="/tmp/terpira_integration_$$"
SRC_ROOT="$WORK/source"
EXTRACT_ROOT="$WORK/extract"
TERPIRA_ROOT="$WORK/terpira-export"
REPORT_PATH="$TARGET_DIR/TERPIRA_INTEGRATION_REPORT.json"
CONFLICT_LOG="$TARGET_DIR/TERPIRA_CONFLICTS.log"
DEPS_MD="$TARGET_DIR/TERPIRA_DEPENDENCIES.md"
TS_HINT_MD="$TARGET_DIR/TERPIRA_TS_CONFIG_HINT.md"

mkdir -p "$WORK" "$SRC_ROOT" "$EXTRACT_ROOT" "$TERPIRA_ROOT" "$TARGET_DIR"
: > "$CONFLICT_LOG"

log() { echo "[terpira-import] $*"; }

fetch_to_file() {
  local src="$1"
  local out="$2"
  if [[ "$src" =~ ^https?:// ]]; then
    if command -v curl >/dev/null 2>&1; then
      curl -fsSL "$src" -o "$out"
    else
      wget -qO "$out" "$src"
    fi
  else
    cp "$src" "$out"
  fi
}

record_conflict() {
  local rel="$1"
  local reason="$2"
  echo "$rel | $reason" >> "$CONFLICT_LOG"
}

copy_file_safe() {
  local src="$1"
  local dst="$2"
  local rel="$3"

  mkdir -p "$(dirname "$dst")"
  if [[ -e "$dst" ]]; then
    cp -a "$dst" "$dst.orig"
    if [[ "$OVERWRITE" != "true" ]]; then
      record_conflict "$rel" "exists, kept original, backup at .orig"
      return 0
    fi
    record_conflict "$rel" "exists, overwritten, backup at .orig"
  fi

  cp -a "$src" "$dst"
}

SOURCE_REFERENCE=""
case "$SOURCE_TYPE" in
  bundle)
    if [[ -z "$BUNDLE_PATH" ]]; then
      echo "Fehler: BUNDLE_PATH fehlt." >&2
      exit 3
    fi
    SOURCE_REFERENCE="$BUNDLE_PATH"
    BUNDLE_LOCAL="$WORK/terpira-export.bundle"
    fetch_to_file "$BUNDLE_PATH" "$BUNDLE_LOCAL"

    if [[ -d "$TARGET_DIR/.git" ]]; then
      pushd "$TARGET_DIR" >/dev/null
      git fetch "$BUNDLE_LOCAL" export/terpira:refs/tmp/terpira
      git show-ref refs/tmp/terpira >/dev/null
      if [[ -n "$IMPORT_BRANCH" ]]; then
        git checkout -B "$IMPORT_BRANCH" refs/tmp/terpira || true
      fi
      popd >/dev/null
    else
      git clone "$BUNDLE_LOCAL" "$SRC_ROOT/repo"
      if [[ -d "$SRC_ROOT/repo" ]]; then
        cp -a "$SRC_ROOT/repo/." "$TERPIRA_ROOT/"
      fi
    fi
    ;;
  archive)
    if [[ -z "$ARCHIVE_PATH" ]]; then
      echo "Fehler: ARCHIVE_PATH fehlt." >&2
      exit 3
    fi
    SOURCE_REFERENCE="$ARCHIVE_PATH"
    ARCHIVE_LOCAL="$WORK/terpira-export.tar.gz"
    fetch_to_file "$ARCHIVE_PATH" "$ARCHIVE_LOCAL"
    tar -xzf "$ARCHIVE_LOCAL" -C "$EXTRACT_ROOT"
    ;;
  git)
    if [[ -z "$REPO_URL" ]]; then
      echo "Fehler: REPO_URL fehlt." >&2
      exit 3
    fi
    SOURCE_REFERENCE="$REPO_URL"
    if [[ -n "$REPO_REF" ]]; then
      git clone --depth=1 --branch "$REPO_REF" "$REPO_URL" "$SRC_ROOT/repo"
    else
      git clone --depth=1 "$REPO_URL" "$SRC_ROOT/repo"
    fi
    if [[ -f "$SRC_ROOT/repo/package.json" ]]; then
      if node -e "const p=require('$SRC_ROOT/repo/package.json'); process.exit((p.scripts&&p.scripts['export:bundle'])?0:1)"; then
        pushd "$SRC_ROOT/repo" >/dev/null
        npm ci
        npm run export:bundle
        popd >/dev/null
      fi
    fi
    if [[ -f "$SRC_ROOT/repo/terpira-export.tar.gz" ]]; then
      tar -xzf "$SRC_ROOT/repo/terpira-export.tar.gz" -C "$EXTRACT_ROOT"
    fi
    ;;
  *)
    echo "Fehler: SOURCE_TYPE muss bundle, archive oder git sein." >&2
    exit 3
    ;;
esac

if [[ -d "$SRC_ROOT/repo" ]]; then
  cp -a "$SRC_ROOT/repo/." "$TERPIRA_ROOT/" || true
fi
if [[ -d "$EXTRACT_ROOT" ]]; then
  cp -a "$EXTRACT_ROOT/." "$TERPIRA_ROOT/" || true
fi
if [[ -d "$EXTRACT_ROOT/terpira-export" ]]; then
  cp -a "$EXTRACT_ROOT/terpira-export/." "$TERPIRA_ROOT/"
fi

MANIFEST=""
if [[ -f "$SRC_ROOT/repo/export-manifest.json" ]]; then
  MANIFEST="$SRC_ROOT/repo/export-manifest.json"
elif [[ -f "$TERPIRA_ROOT/export-manifest.json" ]]; then
  MANIFEST="$TERPIRA_ROOT/export-manifest.json"
fi

INCLUDED_JSON="[]"
if [[ -n "$MANIFEST" ]]; then
  INCLUDED_JSON=$(node -e "const fs=require('fs'); const m=JSON.parse(fs.readFileSync('$MANIFEST','utf8')); console.log(JSON.stringify(Array.isArray(m.includedPaths)?m.includedPaths:[]));")
fi

mkdir -p \
  "$TARGET_DIR/src/lib/terpira" \
  "$TARGET_DIR/src/lib/terpira/components" \
  "$TARGET_DIR/src/data/terpira" \
  "$TARGET_DIR/public/terpira"

COPIED_TRACK="$WORK/copied_paths.txt"
ADDED_TRACK="$WORK/added_paths.txt"
: > "$COPIED_TRACK"
: > "$ADDED_TRACK"

copy_dir_map() {
  local from="$1"
  local to="$2"
  if [[ ! -d "$from" ]]; then
    return 0
  fi

  while IFS= read -r -d '' f; do
    local rel="${f#$from/}"
    local dst="$to/$rel"
    local target_rel="${dst#$TARGET_DIR/}"
    local existed="false"
    [[ -e "$dst" ]] && existed="true"

    copy_file_safe "$f" "$dst" "$target_rel"
    echo "$target_rel" >> "$COPIED_TRACK"
    if [[ "$existed" == "false" ]]; then
      echo "$target_rel" >> "$ADDED_TRACK"
    fi
  done < <(find "$from" -type f ! -path "*/terpira/*" -print0)
}

# Fallback-Pfade wie im Prompt
copy_dir_map "$TERPIRA_ROOT/src/components" "$TARGET_DIR/src/lib/terpira/components"
copy_dir_map "$TERPIRA_ROOT/src/lib" "$TARGET_DIR/src/lib/terpira"
copy_dir_map "$TERPIRA_ROOT/src/data" "$TARGET_DIR/src/data/terpira"
copy_dir_map "$TERPIRA_ROOT/public" "$TARGET_DIR/public/terpira"

# Optional zusätzlich aus Manifest berücksichtigen
if [[ "$INCLUDED_JSON" != "[]" ]]; then
  node - <<'NODE' "$INCLUDED_JSON" "$TERPIRA_ROOT" "$TARGET_DIR" "$OVERWRITE" "$COPIED_TRACK" "$ADDED_TRACK" "$CONFLICT_LOG"
const fs = require('fs');
const path = require('path');
const [includedJson, root, target, overwrite, copiedTrack, addedTrack, conflictLog] = process.argv.slice(2);
const included = JSON.parse(includedJson);
const map = {
  components: path.join(target, 'src/lib/terpira/components'),
  lib: path.join(target, 'src/lib/terpira'),
  data: path.join(target, 'src/data/terpira'),
  public: path.join(target, 'public/terpira')
};

function ensureDir(p) { fs.mkdirSync(path.dirname(p), { recursive: true }); }
function backupIfExists(dst) {
  if (fs.existsSync(dst)) {
    fs.copyFileSync(dst, dst + '.orig');
    return true;
  }
  return false;
}

for (const rel of included) {
  if (typeof rel !== 'string' || !rel.length) continue;
  if (rel.includes('/terpira/')) continue;
  if (rel.startsWith('terpira/')) continue;
  const top = rel.split('/')[0];
  if (!map[top]) continue;
  const src = path.join(root, rel);
  if (!fs.existsSync(src)) continue;

  const suffix = rel.substring(top.length).replace(/^\//, '');
  const dstBase = suffix ? path.join(map[top], suffix) : map[top];

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    const walk = (dir) => {
      for (const name of fs.readdirSync(dir)) {
        const fp = path.join(dir, name);
        const st = fs.statSync(fp);
        if (st.isDirectory()) walk(fp);
        else {
          const relInDir = path.relative(src, fp);
          const dst = path.join(dstBase, relInDir);
          const targetRel = path.relative(target, dst).replace(/\\/g, '/');
          const existed = fs.existsSync(dst);
          ensureDir(dst);
          if (existed) {
            backupIfExists(dst);
            if (overwrite !== 'true') {
              fs.appendFileSync(conflictLog, `${targetRel} | exists, kept original, backup at .orig\n`);
              continue;
            }
            fs.appendFileSync(conflictLog, `${targetRel} | exists, overwritten, backup at .orig\n`);
          }
          fs.copyFileSync(fp, dst);
          fs.appendFileSync(copiedTrack, targetRel + '\n');
          if (!existed) fs.appendFileSync(addedTrack, targetRel + '\n');
        }
      }
    };
    walk(src);
  } else {
    const dst = dstBase;
    const targetRel = path.relative(target, dst).replace(/\\/g, '/');
    const existed = fs.existsSync(dst);
    ensureDir(dst);
    if (existed) {
      backupIfExists(dst);
      if (overwrite !== 'true') {
        fs.appendFileSync(conflictLog, `${targetRel} | exists, kept original, backup at .orig\n`);
        continue;
      }
      fs.appendFileSync(conflictLog, `${targetRel} | exists, overwritten, backup at .orig\n`);
    }
    fs.copyFileSync(src, dst);
    fs.appendFileSync(copiedTrack, targetRel + '\n');
    if (!existed) fs.appendFileSync(addedTrack, targetRel + '\n');
  }
}
NODE
fi

# Importpfade konservativ anpassen
node - <<'NODE' "$TARGET_DIR"
const fs = require('fs');
const path = require('path');
const target = process.argv[2];
const roots = [
  path.join(target, 'src/lib/terpira'),
  path.join(target, 'src/lib/terpira/components')
].filter((d) => fs.existsSync(d));

const exts = new Set(['.ts', '.tsx', '.js', '.jsx']);
const files = [];
for (const r of roots) {
  const walk = (d) => {
    for (const n of fs.readdirSync(d)) {
      const p = path.join(d, n);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (exts.has(path.extname(p))) files.push(p);
    }
  };
  walk(r);
}

for (const f of files) {
  const raw = fs.readFileSync(f, 'utf8');
  let out = raw;
  out = out.replace(/from\s+['"]\.\.\/\.\.\/components\//g, "from '@/lib/terpira/components/");
  out = out.replace(/from\s+['"]\.\.\/components\//g, "from '@/lib/terpira/components/");
  out = out.replace(/from\s+['"]\.\.\/\.\.\/lib\//g, "from '@/lib/terpira/");
  out = out.replace(/from\s+['"]\.\.\/lib\//g, "from '@/lib/terpira/");

  if (out !== raw) {
    fs.writeFileSync(f + '.orig', raw);
    fs.writeFileSync(f, out);
  }
}
NODE

SUGGESTED_DEPS='[]'
if [[ -f "$TERPIRA_ROOT/package.json" ]]; then
  SUGGESTED_DEPS=$(node -e "const p=require('$TERPIRA_ROOT/package.json'); const want=['react','react-dom','next','tailwindcss','zod']; const out=[]; for(const k of want){ if(p.dependencies&&p.dependencies[k]) out.push({name:k,version:p.dependencies[k]}); } console.log(JSON.stringify(out));")
elif [[ -f "$SRC_ROOT/repo/package.json" ]]; then
  SUGGESTED_DEPS=$(node -e "const p=require('$SRC_ROOT/repo/package.json'); const want=['react','react-dom','next','tailwindcss','zod']; const out=[]; for(const k of want){ if(p.dependencies&&p.dependencies[k]) out.push({name:k,version:p.dependencies[k]}); } console.log(JSON.stringify(out));")
fi

{
  echo "# Terpira Dependency Vorschlag"
  echo
  echo "Keine automatische Installation ausgeführt."
  echo
  node -e "const deps=$SUGGESTED_DEPS; if(!deps.length){console.log('- Keine bekannten Runtime-Dependencies im Export gefunden.');} else deps.forEach(d=>console.log('- '+d.name+': '+d.version));"
} > "$DEPS_MD"

if grep -RInE "from ['\"](@/|~\/|src/)" "$TARGET_DIR/src/lib/terpira" "$TARGET_DIR/src/lib/terpira/components" >/tmp/terpira_alias_hits.txt 2>/dev/null; then
  {
    echo "# TypeScript Alias Hinweise"
    echo
    echo "Es wurden Alias-Imports gefunden. In diesem Next-Projekt ist '@/...' bereits über baseUrl=src und paths aktiviert."
    echo
    echo "Gefundene Stellen:"
    cat /tmp/terpira_alias_hits.txt
  } > "$TS_HINT_MD"
else
  {
    echo "# TypeScript Alias Hinweise"
    echo
    echo "Keine zusätzlichen Alias-Anpassungen erforderlich."
  } > "$TS_HINT_MD"
fi

MANUAL_STEPS_JSON=$(node - <<'NODE' "$MANIFEST" "$CONFLICT_LOG" "$COPIED_TRACK"
const fs=require('fs');
const [manifest, conflictLog, copiedTrack] = process.argv.slice(2);
const steps=[];
if(!manifest) steps.push('Kein export-manifest.json gefunden. Fallback-Kopierregeln wurden genutzt.');
if(fs.existsSync(conflictLog) && fs.readFileSync(conflictLog,'utf8').trim()) steps.push('Konflikte vorhanden. TERPIRA_CONFLICTS.log prüfen.');
if(!fs.existsSync(copiedTrack) || !fs.readFileSync(copiedTrack,'utf8').trim()) steps.push('Keine Dateien kopiert. Quelle auf Export-Artefakte prüfen.');
steps.push('Falls Komponenten framework-spezifisch sind, manuelle Anpassung in App-Router/Build-Konfig prüfen.');
console.log(JSON.stringify(steps));
NODE
)

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

node - <<'NODE' "$REPORT_PATH" "$TIMESTAMP" "$SOURCE_TYPE" "$SOURCE_REFERENCE" "$TARGET_DIR" "$COPIED_TRACK" "$ADDED_TRACK" "$CONFLICT_LOG" "$SUGGESTED_DEPS" "$MANUAL_STEPS_JSON"
const fs = require('fs');
const [reportPath, timestamp, sourceType, sourceReference, targetDir, copiedTrack, addedTrack, conflictLog, depsJson, manualJson] = process.argv.slice(2);

const uniq = (arr) => [...new Set(arr)];
const readLines = (p) => fs.existsSync(p)
  ? fs.readFileSync(p, 'utf8').split('\n').map(s => s.trim()).filter(Boolean)
  : [];

const copiedPaths = uniq(readLines(copiedTrack));
const addedFiles = uniq(readLines(addedTrack));
const conflicts = uniq(readLines(conflictLog));
const suggestedDependencies = JSON.parse(depsJson || '[]');
const manualSteps = JSON.parse(manualJson || '[]');

const report = {
  timestamp,
  sourceType,
  sourceReference,
  copiedPaths,
  addedFiles,
  conflicts,
  suggestedDependencies,
  manualSteps
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
NODE

if [[ "$ENABLE_COMMIT" == "true" && -d "$TARGET_DIR/.git" ]]; then
  pushd "$TARGET_DIR" >/dev/null
  if [[ -n "$IMPORT_BRANCH" ]]; then
    git checkout -B "$IMPORT_BRANCH" || true
  fi
  git add .
  git commit -m "chore: import Terpira export" || true
  popd >/dev/null
fi

log "Report erstellt: $REPORT_PATH"
exit 0
