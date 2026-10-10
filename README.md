# SNAPSHIFT ⚡

Neon magnetic block puzzle game for web and future iOS.

## Live website
Vercel deploys this repository's `main` branch. The website uses `npm run build`, which copies `index.html` and `manifest.webmanifest` into `www/`.

## iOS (prepared, not built or submitted)
Bundle identifier: `com.jdarkyeka6.snapshift`.
Capacitor app name: `SnapShift`.

On a **Mac** with Xcode and Node.js:
```bash
npm install
npm run ios:add     # First time only
npm run ios:sync    # After editing the game
npm run ios:open    # Open in Xcode
```

In Xcode choose your Apple Developer team and signing. Before TestFlight, add your app icon, test actual iPhone gameplay and audio, check safe areas and offline behavior, and complete App Store privacy/support information.

## Local
Open `index.html` in a browser, or run `npm run build` to populate `www/`. The current game stores high scores locally; there is no backend.
