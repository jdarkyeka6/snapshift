# SNAPSHIFT: first TestFlight build

## Confirmed project settings
- App name: **SnapShift**
- App Store Connect record: created by owner
- Bundle identifier: `com.jdarkyeka6.snapshift`
- SKU: `SnapShift001`
- First proposed marketing version: `1.0` (the generated Xcode project uses its own version setting)
- Build number: automatically assigned from the GitHub Actions workflow run number

**Important:** Creating an App Store Connect app is not the same as uploading a TestFlight build. Apple requires a signed **device** IPA and processes it after upload. A simulator build does not qualify.

## 1. First test the simulator build
In GitHub, open **Actions → iOS Simulator Build**. The workflow automatically runs when the iOS/game source changes, and can be manually run. It publishes an unsigned `App.app` and a generated `ios/` Xcode project as artifacts.

## 2. Prepare Apple signing
In the Apple Developer portal, create or reuse:
- An **Apple Distribution** certificate and export its certificate **and private key** to a password-protected `.p12`.
- An **App Store Connect** distribution provisioning profile for `com.jdarkyeka6.snapshift` that includes that certificate.
- An App Store Connect API key with sufficient permissions to upload builds. Download the private `.p8` key once.
- Find your Apple developer Team ID and App Store Connect API issuer ID/key ID.

In GitHub repository **Settings → Secrets and variables → Actions**, set:

| Type | Name | Value |
| --- | --- | --- |
| Secret | `IOS_DISTRIBUTION_P12_BASE64` | Base64 of the Apple Distribution certificate+private key `.p12` |
| Secret | `IOS_DISTRIBUTION_P12_PASSWORD` | Password used to export the `.p12` |
| Secret | `IOS_PROVISIONING_PROFILE_BASE64` | Base64 of the App Store Connect `.mobileprovision` |
| Secret | `APPSTORE_API_PRIVATE_KEY` | Entire content of the App Store Connect `.p8` |
| Variable | `APPLE_TEAM_ID` | Apple developer Team ID |
| Variable | `APPSTORE_API_KEY_ID` | API key ID |
| Variable | `APPSTORE_ISSUER_ID` | API issuer ID |

On macOS, create base64 strings without line breaks with `base64 -i certificate.p12 | tr -d '\n'` and likewise for the profile. **Do not paste signing credentials into ChatGPT or commit them in GitHub**. Keep them in private repository Actions secrets. For increased safety, protect the optional GitHub environment named `testflight` with required reviewers.

## 3. Review the generated App Icon and test the game
The build generates an original opaque 1024×1024 SnapShift App Icon using `scripts/generate-icon.mjs`, replacing Capacitor's default placeholder. Review it before distribution. Test safe areas on notch/Dynamic Island phones, score persistence, touch placement, accessibility, audio, and offline behavior.

## 4. Upload
In GitHub **Actions → TestFlight Release → Run workflow**, run the manually gated upload **only when credentials and icon are configured**. The workflow attempts to archive and upload to App Store Connect. It does not publish to the App Store.

For local distribution on a Mac, use Xcode Organizer → Archive → Distribute App → App Store Connect, ensuring your team and signing are correct.

## 5. After upload
Apple will process the uploaded build, which may take time, before it appears under the existing App Store Connect app → TestFlight. Finish the beta app info and compliance questions, then add internal testers. Upload success is not the same as approval, processing completion, or tester availability.
