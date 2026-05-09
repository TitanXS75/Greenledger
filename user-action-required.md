# Action Required: Firebase Configuration & Setup

To make the GreenLedger application fully functional, please complete the following steps:

## 1. Firebase Credentials
The application is set up to use Firebase, but you need to provide your own API keys. 
Update the file `src/environments/environment.ts` with your project's configuration from the Firebase Console (Settings > General > Your apps).

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
  }
};
```

## 2. Firebase Project Setup
Go to [Firebase Console](https://console.firebase.google.com/):
- **Enable Authentication**: Enable "Email/Password" provider.
- **Enable Firestore**: Create a database in "Production mode" or "Test mode". The rules have already been provided in `firestore.rules`.
- **Enable Cloud Functions**: (Requires Blaze plan). If on Spark plan, the HTTP trigger `generateSummary` will still work via CLI simulation, but scheduled functions won't run.

## 3. Deploy Firestore Rules
Run the following command to apply the security rules:
```bash
firebase deploy --only firestore:rules
```

## 4. Deploy Cloud Functions
Run the following command to deploy the backend summary logic:
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## 5. Running E2E Tests
To run the Playwright tests, ensure the app is running (`npm start`) and then execute:
```bash
npx playwright test
```

## 6. Bonus Features Checklist
- [ ] Implement PDF Export in `ExpenseTrackerComponent` (jsPDF logic).
- [ ] Add `Toastify` notifications in service catch blocks.
- [ ] Add Chart.js to `DashboardComponent`.
