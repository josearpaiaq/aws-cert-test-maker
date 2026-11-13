#!/usr/bin/env bash
# Builds a release APK and copies it to dist/CloudPrep-<version>.apk, using the version in
# app.json. Usage: npm run build:apk
#
# Only the arm64-v8a ABI is built: it covers practically every phone from the last several
# years and keeps the APK small. Set ABIS="arm64-v8a,armeabi-v7a,x86_64" for older phones or
# emulators.
set -euo pipefail

VERSION=$(node -p "require('./app.json').expo.version")
ABIS=${ABIS:-arm64-v8a}
OUT="dist/CloudPrep-$VERSION.apk"

npm run validate:questions --silent
# Regenerate android/ from app.json (icons, app ID, plugins), then build the release APK.
npx expo prebuild --platform android --no-install
(cd android && ./gradlew app:assembleRelease -x lint -x test -PreactNativeArchitectures="$ABIS")

mkdir -p dist
cp android/app/build/outputs/apk/release/app-release.apk "$OUT"
echo "Built $OUT ($(du -h "$OUT" | cut -f1))"
