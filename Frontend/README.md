# 💰 Loan App - Modern Web Application

A comprehensive loan management application built with vanilla JavaScript, Firebase Firestore, and responsive CSS. Track loans, customers, payments, vendors, and generate detailed reports with real-time synchronization.

## 🚀 Quick Start

### 1. **Firebase Setup** (5 minutes)
See [Firebase Setup Guide](docs/FIREBASE_SETUP.md) for step-by-step instructions to:
- Create Firebase project
- Enable Authentication (Email/Password)
- Set up Firestore database
- Configure security rules

### 2. **Open the App**
```
Simply open index.html in a web browser
```

### 3. **Create Account**
- Sign up with email and password
- All your data is saved to Firebase automatically

---

## 📁 Project Structure

```
Loan App/
├── index.html                 # Main HTML file
├── README.md                  # This file
├── FIREBASE_SETUP.md          # Detailed Firebase setup guide (old location)
│
├── css/                       # Modular CSS files
│   ├── main.css              # Global styles & layout
│   ├── auth.css              # Authentication UI
│   ├── dashboard.css         # Dashboard styles
│   ├── master.css            # Master data tabs
│   ├── loan.css              # Loan section
│   ├── reports.css           # Reports section
│   └── responsive.css        # Mobile responsive design
│
├── js/                        # Modular JavaScript files
│   ├── firebase.js           # Firebase initialization & sync
│   ├── auth.js               # Authentication logic
│   ├── utils.js              # Utility functions
│   ├── components.js         # UI components & data arrays
│   ├── dashboard.js          # Dashboard & interest calculation
│   ├── loans.js              # Loan management (CRUD)
│   ├── payments.js           # Payment management (CRUD)
│   ├── master.js             # Master data (customers, vendors, banks, UPI)
│   ├── passbook.js           # Vendor passbook & customer ledger
│   ├── reports.js            # Reports (placeholder)
│   ├── exports.js            # Excel & PDF export functions
│   └── app.js                # App initialization & navigation
│
├── assets/                    # Application assets
│   ├── images/               # Image files
│   ├── icons/                # Icon files
│   └── logo/                 # Logo files
│
└── docs/                      # Documentation
    ├── FIREBASE_SETUP.md      # Firebase setup guide
    ├── API_DOCS.md            # Complete API documentation
    └── CHANGELOG.md           # Version history & updates
```

---

## 🎯 Key Features

### 📊 Dashboard
- Total amount given to customers
- Total amount received from payments
- Pending loan balance
- Generated interest tracking
- Interest calculation by date filter

### 👥 Master Data Management
- **Customers:** Add, edit, delete, view, lock/unlock
- **Vendors:** Manage vendor details with passbook tracking
- **Banks:** Store multiple bank account information
- **UPI IDs:** Manage payment UPI addresses
- **Additional Fields:** Create custom fields for any entity

### 💳 Loan Management
- Create loans with flexible interest types (monthly/yearly)
- Track multiple transaction modes (Cash/Bank/UPI/Cheque)
- Lock/unlock loans
- Calculate remaining balance automatically
- Unique loan ID generation

### 💰 Payment Processing
- Record payments with validation against loan balance
- Support for multiple payment modes
- Automatic balance calculation
- Prevent overpayment

### 📔 Passbook & Ledger
- **Passbook:** Running account for vendor transactions
- **Ledger:** Complete transaction history per customer
  - Loan disbursements
  - Interest calculations
  - Payment receipts
  - Running balance

### 📈 Reports & Exports
- Export to Excel (XLSX)
- Export to PDF
- Customizable reports for:
  - Customers
  - Vendors
  - Loans
  - Payments
  - Passbook entries

### 🔄 Real-Time Sync
- Firebase Firestore integration
- Automatic data synchronization across devices
- Real-time updates for multi-user environments

---

## 🔧 Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Backend** | Firebase Firestore |
| **Auth** | Firebase Authentication (Email/Password) |
| **Export** | XLSX, jsPDF, html2canvas |
| **UI** | Responsive CSS with flexbox |
| **Notifications** | SweetAlert2 |

---

## 📝 Module Documentation

Each JavaScript module handles a specific domain:

| Module | Purpose | Key Functions |
|--------|---------|---|
| **firebase.js** | Firebase init & data sync | `initializeFirebase()`, `save()`, `setupFirestoreListener()` |
| **auth.js** | User authentication | `handleLogin()`, `handleSignup()`, `handleLogout()` |
| **components.js** | UI components | `populateBankDropdown()`, `clearAllForms()` |
| **dashboard.js** | Dashboard metrics | `updateDashboard()`, `generateInterest()` |
| **loans.js** | Loan CRUD operations | `addLoan()`, `loadLoans()`, `filterLoans()` |
| **payments.js** | Payment management | `addPayment()`, `loadPayments()` |
| **master.js** | Master data CRUD | `addCustomer()`, `addVendor()`, `addBank()`, etc. |
| **passbook.js** | Passbook & ledger | `loadPassbookEntries()`, `loadLedger()` |
| **exports.js** | Export functions | `exportCustomersToExcel()`, `exportLoansToPDF()`, etc. |
| **app.js** | App initialization | `initApp()`, `showSection()` |

---

## 🔐 Security

### Firestore Security Rules
The app uses security rules to ensure users can only access their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## 💻 Data Structures

### Customer
```javascript
{
  id: timestamp,
  name: string,
  mobile: string,
  ref: string,
  pan: string,
  address: string,
  remark: string,
  locked: boolean,
  additionalDetails: object
}
```

### Loan
```javascript
{
  id: timestamp,
  customerId: id,
  loanNo: number,
  amount: number,
  rate: number,
  period: "monthly" | "yearly",
  loanMode: "Cash" | "Bank" | "UPI" | "Cheque",
  startDate: date,
  lastInterestDate: date,
  locked: boolean
}
```

### Payment
```javascript
{
  loanId: id,
  amount: number,
  date: date,
  paymentMode: string,
  additionalDetails: object
}
```

For complete data structures, see [API_DOCS.md](docs/API_DOCS.md)

---

## 🐛 Troubleshooting

### Firebase Not Connecting
1. Check your Firebase config in index.html
2. Verify project ID matches Firebase Console
3. Enable Authentication and Firestore in Firebase
4. Check browser console for detailed errors

### Data Not Syncing
1. Ensure you're signed in with correct account
2. Check Firestore Database tab in Firebase Console
3. Verify security rules allow read/write
4. Check browser console for errors

### Export Not Working
1. Ensure XLSX and jsPDF libraries loaded (check Network tab)
2. Verify data exists in the app
3. Try different browser if issues persist

---

## 📚 Additional Resources

- [Firebase Setup Guide](docs/FIREBASE_SETUP.md)
- [API Documentation](docs/API_DOCS.md)
- [Changelog](docs/CHANGELOG.md)
- [Firebase Console](https://console.firebase.google.com/)

---

## 🎓 Learning & Development

### Module Loading Order
⚠️ **CRITICAL:** The JavaScript modules load in a specific order (see index.html). This order ensures:

1. **firebase.js** - Firebase initialized first
2. **utils.js** - Utilities available for all modules
3. **components.js** - Global data arrays available
4. **dashboard.js** - Dashboard functions
5. **loans.js** - Loan functions
6. **payments.js** - Payment functions
7. **passbook.js** - Passbook functions
8. **master.js** - Master data functions
9. **reports.js** - Reports functions
10. **exports.js** - Export functions
11. **auth.js** - Auth with Firebase initialized
12. **app.js** - App initialization (must be last)

---

## 🚀 Future Enhancements

- [ ] Advanced analytics dashboard
- [ ] Email/SMS notifications
- [ ] Digital signatures
- [ ] Document attachment storage
- [ ] Multi-language support
- [ ] Dark mode
- [ ] User roles & permissions
- [ ] Backup & restore functionality

---

## 📄 License

This project is open-source and available for personal and commercial use.

---

## 🤝 Support

For issues, questions, or suggestions:
1. Check the [API_DOCS.md](docs/API_DOCS.md) for function reference
2. Review [FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md) for setup issues
3. Check browser console for error messages

---

**Last Updated:** June 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

*Built with ❤️ using Firebase & Vanilla JavaScript*
