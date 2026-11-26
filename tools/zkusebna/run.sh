#!/usr/bin/env bash
# Zkušebna P.U.B. Idle – celý běh jedním příkazem (bez okna): build → vite preview → 4 boti → čísla + zadání pro hodnotitele.
# Použití: bash tools/zkusebna/run.sh [složka běhu]   (výchozí ZkusebnaRuns/<datum_čas>)
set -euo pipefail
cd "$(dirname "$0")/../.."
RUN="${1:-ZkusebnaRuns/$(date +%Y-%m-%d_%H%M)}"
mkdir -p "$RUN"
# boti hrají sestavenou hru (vite preview), ne vývojový server: úprava zdrojáku během běhu by hru přenačetla a boti by se zpomalili na skutečný čas
npm run build > "$RUN/build.log" 2>&1
npx vite preview --port 5178 --strictPort > "$RUN/vite.log" 2>&1 &
VITE=$!
trap 'kill $VITE 2>/dev/null || true' EXIT
for _ in $(seq 1 40); do curl -s -o /dev/null http://localhost:5178/ && break; sleep 0.5; done
export ZK_URL=http://localhost:5178/
node tools/zkusebna/bot.mjs novacek "$RUN" 15 cs &
node tools/zkusebna/bot.mjs bezny "$RUN" 180 cs &
node tools/zkusebna/bot.mjs slaby "$RUN" 240 cs &
node tools/zkusebna/bot.mjs dlouhy "$RUN" 600 cs &
wait
python3 tools/zkusebna/human_half.py score "$RUN"
echo
echo "Hotovo: $RUN/auto.json a $RUN/review/prompt.md."
echo "Dál: hodnotitel (Fable) udělá, co je v review/prompt.md → review/hodnoceni.json, pak:"
echo "  python3 tools/zkusebna/human_half.py merge $RUN"
