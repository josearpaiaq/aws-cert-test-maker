#!/usr/bin/env bash
# Measures CloudPrep on a connected Android device: cold start, scrolling a 500-question list,
# and the swipe between practice cards. Install a RELEASE build first (debug builds are much
# slower): npm run android:release
#
# Usage: scripts/measure-android.sh [runs]   (default 5 cold starts)
set -euo pipefail

PKG=io.github.josearpaiaq.cloudprep
ACTIVITY="$PKG/.MainActivity"
RUNS=${1:-5}

median() { sort -n | awk '{a[NR]=$1} END {print (NR%2 ? a[(NR+1)/2] : int((a[NR/2]+a[NR/2+1])/2))}'; }

echo "== Cold start ($RUNS runs)"
first_frame=(); interactive=()
# Milliseconds since the epoch for the first log line matching a pattern (logcat -v epoch).
log_ms() {
  adb logcat -d -v epoch | grep -E "$1" | head -1 | awk '{split($1, t, "."); print t[1] * 1000 + substr(t[2] "000", 1, 3)}'
}
for _ in $(seq "$RUNS"); do
  adb shell am force-stop "$PKG"
  sleep 2
  adb logcat -c
  total=$(adb shell am start -W -n "$ACTIVITY" | awk '/TotalTime/ {print $2}' | tr -d '\r')
  first_frame+=("$total")
  # Wait for the Study tab to log that its data is on screen.
  for _ in $(seq 100); do
    adb logcat -d -s ReactNativeJS:I | grep -q 'study-interactive' && break
    sleep 0.1
  done
  start_ms=$(log_ms "ActivityTaskManager: START u0.*$PKG")
  marked_ms=$(log_ms 'study-interactive')
  interactive+=($((marked_ms - start_ms)))
  sleep 1
done
echo "first frame (ms):          ${first_frame[*]}  -> median $(printf '%s\n' "${first_frame[@]}" | median)"
echo "interactive Study (ms):    ${interactive[*]}  -> median $(printf '%s\n' "${interactive[@]}" | median)"

frames() {
  adb shell dumpsys gfxinfo "$PKG" | grep -E 'Total frames rendered|Janky frames:|50th percentile|90th percentile|95th percentile|99th percentile' | grep -v gpu | sed 's/^ */  /'
}

echo "== Scrolling the question browser (130 questions x 4 = 520 rows)"
adb shell am start -a android.intent.action.VIEW -d "cloudprep://browse?repeat=4" "$PKG" >/dev/null
sleep 3
adb shell dumpsys gfxinfo "$PKG" reset >/dev/null
for _ in $(seq 8); do adb shell input swipe 540 1900 540 500 120; sleep 0.6; done
for _ in $(seq 8); do adb shell input swipe 540 500 540 1900 120; sleep 0.6; done
frames

echo "== Swiping between practice cards"
echo "Open a practice session on the phone, then press Enter. After each card is answered,"
echo "swipe it away yourself; press Enter again when done."
read -r
adb shell dumpsys gfxinfo "$PKG" reset >/dev/null
read -r
frames
