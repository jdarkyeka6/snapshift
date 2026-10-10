#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

: "${IOS_DISTRIBUTION_P12_BASE64:?Missing IOS_DISTRIBUTION_P12_BASE64 secret}"
: "${IOS_DISTRIBUTION_P12_PASSWORD:?Missing IOS_DISTRIBUTION_P12_PASSWORD secret}"
: "${IOS_PROVISIONING_PROFILE_BASE64:?Missing IOS_PROVISIONING_PROFILE_BASE64 secret}"
: "${APPSTORE_API_PRIVATE_KEY:?Missing APPSTORE_API_PRIVATE_KEY secret}"
: "${APPLE_TEAM_ID:?Missing APPLE_TEAM_ID variable}"
: "${APPSTORE_API_KEY_ID:?Missing APPSTORE_API_KEY_ID variable}"
: "${APPSTORE_ISSUER_ID:?Missing APPSTORE_ISSUER_ID variable}"

base_dir="$(pwd)"
temp="$(mktemp -d)"
keychain="$temp/snapshift.keychain-db"
password="$(openssl rand -hex 18)"
cleanup() {
  security delete-keychain "$keychain" >/dev/null 2>&1 || true
  rm -rf "$temp"
}
trap cleanup EXIT

printf '%s' "$IOS_DISTRIBUTION_P12_BASE64" | base64 -D > "$temp/distribution.p12"
printf '%s' "$IOS_PROVISIONING_PROFILE_BASE64" | base64 -D > "$temp/profile.mobileprovision"
security cms -D -i "$temp/profile.mobileprovision" > "$temp/profile.plist"

profile_name="$(/usr/libexec/PlistBuddy -c 'Print :Name' "$temp/profile.plist")"
profile_uuid="$(/usr/libexec/PlistBuddy -c 'Print :UUID' "$temp/profile.plist")"
PROFILE_PLIST="$temp/profile.plist" python3 - <<'PY'
import os, plistlib
with open(os.environ["PROFILE_PLIST"], "rb") as f:
    p = plistlib.load(f)
expected = f"{os.environ['APPLE_TEAM_ID']}.com.jdarkyeka6.snapshift"
actual = p["Entitlements"].get("application-identifier")
if actual != expected:
    raise SystemExit(f"Provisioning profile bundle identifier mismatch: expected {expected}, got {actual}")
print("Distribution profile matches SnapShift bundle ID.")
PY

security create-keychain -p "$password" "$keychain"
security unlock-keychain -p "$password" "$keychain"
security set-keychain-settings -lut 21600 "$keychain"
security import "$temp/distribution.p12" -k "$keychain" -P "$IOS_DISTRIBUTION_P12_PASSWORD" -T /usr/bin/codesign
security set-key-partition-list -S apple-tool:,apple: -s -k "$password" "$keychain"
security list-keychains -d user -s "$keychain" "$HOME/Library/Keychains/login.keychain-db"

mkdir -p "$HOME/Library/MobileDevice/Provisioning Profiles" "$HOME/.appstoreconnect/private_keys" "$base_dir/build/ios"
cp "$temp/profile.mobileprovision" "$HOME/Library/MobileDevice/Provisioning Profiles/$profile_uuid.mobileprovision"
printf '%s' "$APPSTORE_API_PRIVATE_KEY" > "$HOME/.appstoreconnect/private_keys/AuthKey_${APPSTORE_API_KEY_ID}.p8"
chmod 600 "$HOME/.appstoreconnect/private_keys/AuthKey_${APPSTORE_API_KEY_ID}.p8"

xcodebuild -resolvePackageDependencies -project ios/App/App.xcodeproj -scheme App
xcodebuild \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$base_dir/build/ios/SnapShift.xcarchive" \
  CODE_SIGN_STYLE=Manual \
  CODE_SIGN_IDENTITY="Apple Distribution" \
  DEVELOPMENT_TEAM="$APPLE_TEAM_ID" \
  PROVISIONING_PROFILE_SPECIFIER="$profile_name" \
  CURRENT_PROJECT_VERSION="${GITHUB_RUN_NUMBER:-1}" \
  archive

PROFILE_NAME="$profile_name" python3 - <<'PY'
import os, plistlib
p = {
  "method": "app-store-connect",
  "destination": "export",
  "signingStyle": "manual",
  "teamID": os.environ["APPLE_TEAM_ID"],
  "signingCertificate": "Apple Distribution",
  "provisioningProfiles": {
    "com.jdarkyeka6.snapshift": os.environ["PROFILE_NAME"],
  },
}
with open("build/ios/ExportOptions.plist", "wb") as f:
    plistlib.dump(p, f)
PY
xcodebuild -exportArchive \
  -archivePath "$base_dir/build/ios/SnapShift.xcarchive" \
  -exportOptionsPlist "$base_dir/build/ios/ExportOptions.plist" \
  -exportPath "$base_dir/build/ios/export"

ipa="$(find "$base_dir/build/ios/export" -maxdepth 1 -name '*.ipa' -print -quit)"
test -n "$ipa" || { echo 'No signed .ipa was exported' >&2; exit 1; }

# The API private key remains on the ephemeral runner, never in GitHub artifacts.
xcrun altool --upload-app --file "$ipa" --type ios \
  --apiKey "$APPSTORE_API_KEY_ID" \
  --apiIssuer "$APPSTORE_ISSUER_ID"

echo "IPA uploaded to App Store Connect; Apple must still process it for TestFlight."
