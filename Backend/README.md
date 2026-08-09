# Loan App Backend

Express REST API for the Loan App. Handles Firestore data persistence, interest generation, loan balance calculation, dashboard stats, and ledger — logic moved from the frontend.

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Firebase Admin credentials

1. Open [Firebase Console](https://console.firebase.google.com/) → Project **loan-app-e110f**
2. Go to **Project Settings** → **Service accounts**
3. Click **Generate new private key** and save the JSON file as `backend/serviceAccountKey.json`

Or copy `.env.example` to `.env` and set `GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json`.

### 3. Run the server

```bash
npm run dev
```

Server starts at `http://localhost:3000`.

## API Endpoints

All protected routes require header: `Authorization: Bearer <firebase-id-token>`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/data` | Load all user data |
| PUT | `/api/data` | Save all user data |
| POST | `/api/interest/generate` | Generate interest logs |
| GET | `/api/dashboard?date=YYYY-MM-DD` | Dashboard statistics |
| GET | `/api/loans/balances` | All loan remaining balances |
| GET | `/api/loans/:loanId/balance` | Single loan balance |
| POST | `/api/loans/validate-payment` | Validate payment amount |
| GET | `/api/ledger/:customerId` | Customer ledger rows |

## Project Structure

```
backend/
├── src/
│   ├── index.js              # Express server entry
│   ├── config/firebase.js    # Firebase Admin init
│   ├── middleware/           # Auth + error handling
│   ├── services/             # Business logic (from frontend)
│   ├── routes/               # API routes
│   └── utils/                # Shared helpers
├── package.json
└── .env.example
```

## Moved from Frontend

| Frontend file | Backend service |
|---------------|-----------------|
| `firebase.js` (save/load) | `services/dataService.js` |
| `dashboard.js` (generateInterest) | `services/interestService.js` |
| `dashboard.js` (updateDashboard) | `services/dashboardService.js` |
| `utils.js` (calculateLoanBalance) | `services/loanService.js` |
| `passbook.js` (loadLedger) | `services/ledgerService.js` |
| `payments.js` (validation) | `services/loanService.js` |

Frontend still handles UI rendering, forms, and Firebase **client auth** (login/signup). Data and business logic go through this API.
