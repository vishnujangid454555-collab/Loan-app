# Loan App - API Documentation

## Overview
This document provides comprehensive documentation for the Loan App's JavaScript API and module structure.

## Module Structure

### firebase.js
Core Firebase initialization and data persistence.

**Functions:**
- `initializeFirebase()` - Initializes Firebase connection
- `save()` - Saves all data to Firestore
- `loadUserDataFromFirestore()` - Loads user data from Firestore
- `setupFirestoreListener()` - Sets up real-time Firestore listener
- `showAuthError(message)` - Displays authentication errors

**Global Variables:**
- `auth` - Firebase authentication instance
- `db` - Firebase database instance
- `currentUser` - Current logged-in user object
- `userDataLoaded` - Flag for data load status
- `isSaving` - Flag to prevent recursive saves

---

### auth.js
Authentication and user management.

**Functions:**
- `toggleAuthForm(e)` - Toggles between login and signup forms
- `handleLogin()` - Handles user login
- `handleSignup()` - Handles user registration
- `checkIfEmailExists(email)` - Verifies if email is registered
- `handleLogout()` - Logs out current user
- `setupAuthListener()` - Sets up Firebase auth state listener

---

### utils.js
Utility and helper functions.

**Functions:**
- `openViewModal(title, content)` - Opens a details modal
- `closeViewModal()` - Closes the modal
- `formatDate(date)` - Formats date as YYYY-MM-DD
- `calculateLoanBalance(loanId)` - Calculates remaining loan balance
- `viewCustomer(id)` - Displays customer details
- `viewLoan(id)` - Displays loan details
- `viewVendor(id)` - Displays vendor details
- `viewBank(id)` - Displays bank details
- `viewUPI(id)` - Displays UPI details
- `viewAdditionalDetail(id)` - Displays additional detail

---

### components.js
UI component management and rendering.

**Functions:**
- `populateBankDropdown(selectId)` - Populates bank selection dropdown
- `populateUPIDropdown(selectId)` - Populates UPI selection dropdown
- `updateLoanBankUPI()` - Updates loan transaction mode fields
- `updatePaymentBankUPI()` - Updates payment transaction mode fields
- `clearAllForms()` - Clears all form fields
- `toggleAdditionalDetails(type)` - Toggles additional details display
- `renderLoanAdditionalFields()` - Renders loan additional fields
- `renderCustomerAdditionalFields()` - Renders customer additional fields
- `renderPaymentAdditionalFields()` - Renders payment additional fields
- `renderVendorAdditionalFields()` - Renders vendor additional fields

---

### dashboard.js
Dashboard and interest management.

**Functions:**
- `updateDashboard()` - Updates dashboard statistics
- `generateInterest()` - Generates monthly/yearly interest on loans

---

### loans.js
Loan management operations.

**Functions:**
- `addLoan()` - Adds new loan
- `handleLoanAction(selectElement, id)` - Handles loan actions (view, edit, delete, lock)
- `loadLoans()` - Loads and displays loans
- `filterLoans()` - Filters loans based on search criteria

**Global Variables:**
- `editingLoanId` - ID of loan being edited

---

### payments.js
Payment management operations.

**Functions:**
- `addPayment()` - Adds new payment record
- `loadPayments()` - Loads and displays payments
- `handlePaymentAction(selectElement, index)` - Handles payment actions
- `filterPayments()` - Filters payments based on search criteria

---

### master.js
Master data management (customers, vendors, banks, UPI, additional details).

**Functions:**
- `showMasterTab(tabName)` - Switches master tabs
- `getCustomerInputIds()` - Gets customer input field IDs
- `addCustomer()` - Adds new customer
- `deleteCustomer(id)` - Deletes customer (with validation)
- `handleCustomerAction(selectElement, id)` - Handles customer actions
- `loadCustomers()` - Loads and displays customers
- `addVendor()` - Adds new vendor
- `loadVendors()` - Loads and displays vendors
- `handleVendorAction(selectElement, id)` - Handles vendor actions
- `addBank()` - Adds new bank account
- `loadBanks()` - Loads and displays banks
- `handleBankAction(selectElement, id)` - Handles bank actions
- `addUPI()` - Adds new UPI ID
- `loadUPIs()` - Loads and displays UPI IDs
- `handleUPIAction(selectElement, id)` - Handles UPI actions
- `addAdditionalDetail()` - Adds custom additional detail
- `loadAdditionalDetails()` - Loads and displays additional details
- `handleAdditionalDetailAction(selectElement, id)` - Handles additional detail actions

**Global Variables:**
- `editingCustomerId`, `editingVendorId`, `editingBankId`, `editingUPIId`, `editingAdditionalDetailId` - IDs of items being edited

---

### passbook.js
Passbook and ledger management.

**Functions:**
- `loadPassbookVendors()` - Populates passbook vendor selector
- `addPassbookEntry()` - Adds passbook entry
- `loadPassbookEntries()` - Loads and displays passbook entries
- `deletePassbookEntry(id)` - Deletes passbook entry
- `filterPassbook()` - Filters passbook entries
- `loadLedger()` - Loads and displays customer ledger

---

### app.js
Application initialization and navigation.

**Functions:**
- `showSection(id)` - Shows specific section/page
- `initApp()` - Initializes the application on load

---

## Data Structures

### Customer Object
```javascript
{
  id: timestamp,
  name: string,
  mobile: string,
  ref: string,
  pan: string,
  address: string,
  remark: string,
  additionalDetails: object,
  locked: boolean,
  createdAt: ISO string
}
```

### Loan Object
```javascript
{
  id: timestamp,
  customerId: id,
  loanNo: number,
  amount: number,
  rate: number (percentage),
  period: "monthly" | "yearly",
  loanMode: "Cash" | "Bank" | "UPI" | "Cheque",
  loanBank: id,
  loanUPI: id,
  startDate: date string,
  lastInterestDate: date string,
  additionalDetails: object,
  locked: boolean
}
```

### Payment Object
```javascript
{
  loanId: id,
  amount: number,
  date: date string,
  paymentMode: "Cash" | "Bank" | "UPI" | "Cheque",
  paymentBank: id,
  paymentUPI: id,
  additionalDetails: object
}
```

### Interest Log Object
```javascript
{
  loanId: id,
  date: date string,
  amount: number
}
```

### Vendor Object
```javascript
{
  id: timestamp,
  name: string,
  mobile: string,
  email: string,
  company: string,
  gst: string,
  address: string,
  additionalDetails: object,
  locked: boolean
}
```

### Bank Object
```javascript
{
  id: timestamp,
  name: string,
  account: string,
  ifsc: string,
  holder: string,
  branch: string,
  remark: string,
  locked: boolean
}
```

### UPI Object
```javascript
{
  id: timestamp,
  upiId: string,
  name: string,
  mobile: string,
  provider: string,
  remarks: string,
  locked: boolean
}
```

### Passbook Entry Object
```javascript
{
  id: timestamp,
  vendorId: id,
  date: date string,
  amountIn: number,
  amountOut: number,
  remarks: string,
  computedBalance: number (calculated)
}
```

---

## Global Data Arrays
- `customers[]` - All customers
- `loans[]` - All loans
- `payments[]` - All payments
- `interestLogs[]` - All interest calculations
- `vendors[]` - All vendors
- `banks[]` - All bank accounts
- `upiIds[]` - All UPI IDs
- `additionalDetails[]` - All custom fields
- `passbookEntries[]` - All passbook entries

---

## CSS Modules

- **main.css** - Global styles, layout, utilities
- **auth.css** - Authentication UI styles
- **dashboard.css** - Dashboard section styles
- **master.css** - Master section and tabs styles
- **loan.css** - Loan section styles
- **reports.css** - Reports section styles
- **responsive.css** - Mobile and responsive design rules

---

## File Structure
```
project/
├── index.html
├── assets/
│   ├── images/
│   ├── icons/
│   └── logo/
├── css/
│   ├── main.css
│   ├── auth.css
│   ├── dashboard.css
│   ├── master.css
│   ├── loan.css
│   ├── reports.css
│   └── responsive.css
├── js/
│   ├── firebase.js
│   ├── auth.js
│   ├── utils.js
│   ├── components.js
│   ├── dashboard.js
│   ├── loans.js
│   ├── payments.js
│   ├── master.js
│   ├── passbook.js
│   ├── reports.js
│   └── app.js
└── docs/
    ├── FIREBASE_SETUP.md
    ├── API_DOCS.md
    └── CHANGELOG.md
```

---

## Notes
- All data is stored in Firebase Firestore
- Authentication uses Firebase Email/Password provider
- Real-time sync is enabled for multi-device support
- SweetAlert2 is used for notifications
- Export functions support Excel and PDF formats
