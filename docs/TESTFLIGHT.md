# SnapShift: safe automatic signing for TestFlight

**App:** SnapShift · **Bundle ID:** `com.jdarkyeka6.snapshift` · **SKU:** `SnapShift001`

SnapShift now uses Fastlane signing on a GitHub-hosted Mac, the same approach as Wavo, Frame, and TideCam. The workflow can generate an Apple Distribution certificate (if the Apple account permits another), create a SnapShift-specific provisioning profile, sign an IPA and upload it. You do **not** need to export your `.mobileprovision` or a `.p12` file for this path.

**Safety:** Fastlane for SnapShift **never revokes or deletes an existing Apple certificate**. If Apple's distribution certificate quota is full, the workflow stops rather than breaking signing for other apps.

## Add four secrets in the SnapShift repository

Open [SnapShift GitHub Actions secrets](https://github.com/jdarkyeka6/snapshift/settings/secrets/actions) and add repository secrets, or `testflight` environment secrets:

| Name | Value |
| --- | --- |
| `ASC_KEY_ID` | App Store Connect API Key ID |
| `ASC_ISSUER_ID` | App Store Connect API Issuer ID |
| `ASC_KEY_CONTENT` | API `.p8` private key (PEM text or base64) |
| `APPLE_TEAM_ID` | Apple developer Team ID |

These are the same secret names as Wavo, Frame and TideCam, but **GitHub repository secrets are not shared automatically**. Reuse an authorized API key if you still have its private `.p8`; Apple lets you download it only once. Create a new key with appropriate permission if needed. Never share private keys through chat or commit them.

## Release

Open [Actions → TestFlight Release](https://github.com/jdarkyeka6/snapshift/actions/workflows/ios-testflight.yml), select **Run workflow → main**. This is a manual action and uses the `testflight` environment. A successful upload still takes time to appear in App Store Connect's TestFlight tab, pending Apple's processing.

If Apple's certificate quota is reached, do **not** automatically revoke a certificate. Find an existing distribution certificate **and matching private key**, or review which certificates other apps rely upon before deciding whether to free a slot.

**This repository update does not itself upload an app to TestFlight.**
