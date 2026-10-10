# SNAPSHIFT ⚡

Neon magnetic block puzzle for Vercel and native iOS.

- Bundle ID: `com.jdarkyeka6.snapshift`
- App Store Connect SKU: `SnapShift001`
- Web: Vercel builds `main`, `npm run build`, output directory `www/`.
- [iOS Simulator Build](../../actions/workflows/ios-build.yml) produces an unsigned simulator app, generated Xcode project and branded icon.
- [TestFlight Release](../../actions/workflows/ios-testflight.yml) uses a **manual** Fastlane upload. See [setup](docs/TESTFLIGHT.md).

**Safety:** SnapShift will **never revoke existing Apple distribution certificates**. If Apple's certificate quota is exhausted, the upload stops safely. Neither certificate creation nor App Store distribution is triggered by normal Git pushes.

To work locally on macOS: `npm install`, `npm run ios:add`, `npm run ios:open`, and later `npm run ios:sync`.
