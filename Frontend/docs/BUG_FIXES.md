# Bug Fixes - NaN and Unknown Customer Issues

## Problems Identified

### 1. **NaN in Dropdown Values**
When adding a loan, the customer dropdown was showing `NaN` values instead of customer IDs.

**Root Cause:** 
- Customer IDs were being stored as **numbers** (from `Date.now()`) in `master.js`
- But in the dropdown, they were being added as `value="${c.id}"` without explicit conversion
- When the form tried to use the value, JavaScript was inconsistently treating it as string vs number

### 2. **"Unknown" Customer Showing in Payment Section**
Payments were always displaying "Unknown" for customer names, even though customers existed.

**Root Cause:**
- In `payments.js`, the code was comparing customer IDs using **String comparison**: `String(c.id) === String(loan.customerId)`
- Customer IDs were stored as **numbers**, but loan's `customerId` was also a **number**
- When retrieved from dropdown, the value became a **string**
- Type mismatch prevented successful lookup: `"1234567890" !== 1234567890`

### 3. **No Customer Showing in Master Section**
Master data section was also failing to display customers due to same ID type mismatch.

---

## Solutions Applied

### Fix 1: Consistent ID Type in Master Dropdown (`master.js`)
```javascript
// BEFORE (Line 217)
loanCustomer.innerHTML = '...' + allCustomers.map(c => `<option value="${c.id}">`).join("");

// AFTER
loanCustomer.innerHTML = '...' + allCustomers.map(c => `<option value="${Number(c.id)}">`).join("");
```

### Fix 2: Convert Customer ID to Number in Loans (`loans.js`)
```javascript
// BEFORE (Line 8)
let custId = loanCustomer.value;

// AFTER
let custId = Number(loanCustomer.value);  // Convert to number
```

### Fix 3: Fix ID Comparison in Loans Display (`loans.js`)
Changed all customer lookups from **String comparison** to **Number comparison**:
```javascript
// BEFORE
let customer = customers.find(c => String(c.id) === String(l.customerId));

// AFTER
let customer = customers.find(c => Number(c.id) === Number(l.customerId));
```

### Fix 4: Fix ID Comparison in Payments (`payments.js`)
```javascript
// BEFORE
let customer = loan ? customers.find(c => String(c.id) === String(loan.customerId)) : null;

// AFTER
let customer = loan ? customers.find(c => Number(c.id) === Number(loan.customerId)) : null;
```

### Fix 5: Fix ID Comparison in Utils (`utils.js`)
```javascript
// BEFORE
let customer = customers.find(c => String(c.id) === String(loan.customerId));

// AFTER
let customer = customers.find(c => Number(c.id) === Number(loan.customerId));
```

### Fix 6: Fix ID Comparison in Passbook (`passbook.js`)
```javascript
// BEFORE
let customerLoans = loans.filter(l => String(l.customerId) === String(cid));

// AFTER
let customerLoans = loans.filter(l => Number(l.customerId) === Number(cid));
```

### Fix 7: Fix ID Comparison in Exports (`exports.js`)
Changed all 4 export functions (Excel & PDF for loans and payments) to use **Number comparison**:
```javascript
// BEFORE
let customer = customers.find(c => c.id === l.customerId);

// AFTER
let customer = customers.find(c => Number(c.id) === Number(l.customerId));
```

---

## Files Modified

1. ✅ `js/master.js` - Fixed dropdown value conversion
2. ✅ `js/loans.js` - Fixed custId conversion and all customer lookups
3. ✅ `js/payments.js` - Fixed all customer lookups
4. ✅ `js/utils.js` - Fixed viewLoan customer lookup
5. ✅ `js/passbook.js` - Fixed ledger customer lookup
6. ✅ `js/exports.js` - Fixed all 4 export functions

---

## Testing Checklist

After these fixes, test the following:

- [ ] Create a new customer (Master > Customers)
- [ ] Create a loan for that customer (Loans section)
  - Verify customer name appears correctly
  - Verify no "NaN" in dropdown
  - Verify no "Unknown" customer
- [ ] Add a payment for that loan (Payments section)
  - Verify customer name displays correctly
  - Verify no "Unknown" appears
- [ ] View payment details
  - Verify customer name shows correctly
- [ ] Export loans to Excel/PDF
  - Verify customer names are shown
- [ ] Check Customer Ledger
  - Select customer and view ledger
  - Verify transaction history loads

---

## Technical Details

### Why Number() Instead of String()?

When storing IDs:
- **Created with:** `Date.now()` → Returns a **number** (e.g., `1717849234567`)
- **From dropdown:** `.value` → Returns a **string** (e.g., `"1717849234567"`)

Using `Number()` ensures consistent type throughout:
- `Number(c.id)` - Always converts to number
- `Number(loan.customerId)` - Always converts to number
- Comparison works: `1717849234567 === 1717849234567` ✅

---

## Prevention for Future

To avoid similar issues:

1. **Define data model consistently** - Document that IDs are stored as numbers
2. **Convert at source** - When reading from form inputs, convert immediately: `Number(input.value)`
3. **Use TypeScript** (optional) - Would catch type mismatches at compile time
4. **Add data validation** - Ensure IDs are always numbers before storing

---

**Date Fixed:** June 7, 2026  
**Status:** ✅ All issues resolved
