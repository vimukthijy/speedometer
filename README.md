# GPS Speed Tracker

A GPS-powered speedometer app built with **React Native** and **TypeScript**. GPS Speed Tracker lets you monitor your current speed, maximum speed, and average speed during a tracking session, with support for **kilometres per hour (km/h)** and **miles per hour (mph)**.

The app is designed with a clean dark interface and a simple session workflow: start tracking, monitor your speed and GPS accuracy, stop the session, or reset the session statistics.

> **Platform:** Android (React Native CLI project)

## Features

- **Live speedometer** — view your GPS-estimated speed while tracking.
- **Two speed units** — switch between km/h and mph.
- **Session statistics** — view the maximum and average speed for the current session.
- **GPS accuracy indicator** — see the reported location accuracy and signal status.
- **Session controls** — start, stop, and reset a tracking session.
- **Dark interface** — a charcoal theme with green accents.

## Screenshots

<img width="270" height="600" alt="Screenshot_1793965889" src="https://github.com/user-attachments/assets/817abe4a-8638-4fb6-8bb5-f7dec709641e" />
<img width="270" height="600" alt="Screenshot_1793965964" src="https://github.com/user-attachments/assets/a1660f82-ccb8-40f2-a9f9-cfee91f46131" />

## Technology Stack

- [React Native](https://reactnative.dev/) — cross-platform mobile framework
- [TypeScript](https://www.typescriptlang.org/) — application code
- [react-native-geolocation-service](https://github.com/Agontuk/react-native-geolocation-service) — device location updates
- Android native location permissions — access to GPS location while tracking

## Getting Started

### Prerequisites

Before running the project, install and configure:

- Node.js (use a version supported by your React Native project)
- npm (or the package manager used by the project)
- Java Development Kit (JDK) compatible with your React Native/Android Gradle setup
- Android Studio and the Android SDK
- An Android device or emulator

For the most up-to-date environment requirements, follow the [React Native environment setup guide](https://reactnative.dev/docs/set-up-your-environment).

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/gps-speed-tracker.git
cd gps-speed-tracker
```

Replace `YOUR-USERNAME` with the GitHub account that hosts the repository.

### 2. Install dependencies

```bash
npm install
```

If the geolocation package is not already listed in `package.json`, install it with:

```bash
npm install react-native-geolocation-service
```

### 3. Configure Android location permissions

The Android app needs location permission to receive GPS updates. Check that the following permissions are declared in `android/app/src/main/AndroidManifest.xml`, above the `<application>` element:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

The app requests fine location permission at runtime. Users must grant location access for GPS speed tracking to work. The app should explain why this permission is needed before requesting it.

### 4. Run the app

Connect an Android device with USB debugging enabled, or start an Android emulator. Then run:

```bash
npx react-native run-android
```

For more reliable GPS testing, use a physical device outdoors with a clear view of the sky. Emulator location readings may need to be supplied through the emulator's location controls.

## Building a Release App Bundle (AAB)

From the project root, run:

```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

## How Speed Tracking Works

The app receives location updates from the device while a tracking session is active. It uses GPS position changes and filtering to estimate movement speed, then presents the result in the selected unit.

GPS performance depends on the device, satellite visibility, weather, nearby buildings, and other environmental conditions. Readings can fluctuate or take time to stabilize. For best results, test outdoors and allow the device to obtain a reliable GPS fix.

The displayed GPS speed is an estimate and should not be treated as a certified measurement instrument.

## Permissions and Privacy

GPS Speed Tracker requests location permission because location information is required to estimate speed and provide GPS accuracy information.

- Location access is used for the app's GPS tracking feature.
- Tracking is controlled by the user through the app's Start and Stop controls.

## Project Structure

The source code is organized by responsibility. The main application and supporting modules include:

```text
.
├── android/
├── src/
│   ├── components/
│   │   ├── SpeedDisplay.tsx
│   │   └── StatCard.tsx
│   ├── constants/
│   │   └── theme.ts
│   ├── hooks/
│   │   └── useSpeedTracking.ts
│   └── utils/
│       └── speedUtils.ts
├── App.tsx
├── package.json
└── README.md
```

Your repository may contain additional React Native configuration and platform files that are not shown above.

## Contributing

Contributions, bug reports, and suggestions are welcome. To propose a change:

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Open a pull request describing the change.

For bug reports, include the Android version, device model, steps to reproduce the issue, and relevant error messages. Avoid including personal location information or other private data in screenshots and logs.

## License

No license has been specified yet. Unless a license is added to this repository, the source code is not automatically granted for reuse, redistribution, or modification. Add a `LICENSE` file if you intend to publish the project under an open-source license.
