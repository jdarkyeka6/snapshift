# SNAPSHIFT ⚡

A magnetic neon block puzzle for the web and iOS.

## Project identity
- Display name: **SnapShift**
- Bundle identifier: `com.jdarkyeka6.snapshift`
- App Store Connect SKU: `SnapShift001` (set in App Store Connect, not in app source)
- Production source: `main`
- Web build: `npm run build` writes static files to `www/` for Vercel and Capacitor.

## iOS simulator (cloud build)
The [iOS Simulator Build](../../actions/workflows/ios-build.yml) GitHub workflow runs on Apple's macOS/Xcode toolchain after iOS source changes, or manually under **Actions → iOS Simulator Build → Run workflow**. It:
1. Installs Capacitor 8 and builds the bundled web game.
2. Generates the native iOS Xcode project using Swift Package Manager.
3. Generates SnapShift's original four-colour 1024px App Icon.
4. Builds an unsigned iOS Simulator app.
5. Uploads the generated Xcode project and simulator `.app` as GitHub Actions artifacts.

The unsigned simulator app **cannot be installed through TestFlight**.

## TestFlight (prepared, manual release)
See [docs/TESTFLIGHT.md](docs/TESTFLIGHT.md). After you configure Apple distribution signing and App Store Connect API credentials as GitHub Actions secrets, manually start **TestFlight Release**. The workflow will archive, export, and upload an IPA. It is intentionally **not** automatic on every push.

No TestFlight upload or App Store release is implied by creating the iOS workflows.

## Build locally on a Mac
Requirements: Node.js 22+; Xcode 26+; Apple developer account for device/distribution signing.

```bash
npm install
npm run ios:add
npm run ios:open
# After future game changes:
npm run ios:sync
```

The native scaffold is generated on a Mac/cloud Mac from the Capacitor config. `ios/` does not need to be manually maintained for this simple game. Your current iOS project is derived from the same `index.html` used by Vercel.

## Gameplay
Magnetic placement, reactive neon board, three-piece look-ahead planner, combo scoring, local high-score persistence. No account or server necessary.
