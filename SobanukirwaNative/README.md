# Sobanukirwa Android App

Native Android wrapper for the Sobanukirwa Islamic Learning Platform.

## How it works
The APK is a lightweight WebView shell that loads the Render-hosted web app at `https://sobanukirwa.onrender.com`. 

**Auto-updates:** Any changes deployed to Render are instantly available in the app - no reinstallation needed!

## Building locally
1. Open the `android/` folder in Android Studio
2. Sync Gradle
3. Run on device or build APK

## Auto-build via GitHub Actions
Push to `main` branch triggers automatic APK build. Download from GitHub Releases.
