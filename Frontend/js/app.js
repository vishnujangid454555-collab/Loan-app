// ================= APPLICATION INITIALIZATION AND NAVIGATION =================

// NAV
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  if (id === "admin") {
    loadAdminPanel();
  }

  // Clear all form fields when switching pages
  clearAllForms();

  // Render dynamic additional fields for each section
  if (id === "loan") renderLoanAdditionalFields();
  if (id === "customer") renderCustomerAdditionalFields();
  if (id === "payment") {
    renderPaymentAdditionalFields();
    loadPayments();
  }
  if (id === "master") {
    renderCustomerAdditionalFields();
    renderVendorAdditionalFields();
  }
  if (id === "dashboard") {
    updateDashboard();
  }
  if (id === "passbook") {
    loadPassbookTransactors();
    if (document.getElementById("passbookDate")) {
      let today = new Date().toISOString().split('T')[0];
      document.getElementById("passbookDate").value = today;
    }
  }
}

// ================= INITIALIZATION =================
function initApp() {
  // Initialize UI with current data
  loadCustomers();
  loadLoans();
  loadPayments();
  loadLedger();
  loadVendors();
  loadBanks();
  loadUPIs();
  loadAdditionalDetails();
  renderLoanAdditionalFields();
  renderCustomerAdditionalFields();
  renderPaymentAdditionalFields();
  renderVendorAdditionalFields();
  populateBankDropdown("loanBank");
  populateBankDropdown("paymentBank");
  populateUPIDropdown("loanUPI");
  populateUPIDropdown("paymentUPI");
  
  // Generate interest once on app load
  generateInterest();
  updateDashboard();

  // Add search listeners for real-time filtering
  const customerSearchInput = document.getElementById("customerSearch");
  if (customerSearchInput) customerSearchInput.addEventListener("input", loadCustomers);

  const vendorSearchInput = document.getElementById("vendorSearch");
  if (vendorSearchInput) vendorSearchInput.addEventListener("input", loadVendors);

  const loanSearchInput = document.getElementById("loanSearch");
  if (loanSearchInput) loanSearchInput.addEventListener("input", loadLoans);

  const paymentSearchInput = document.getElementById("paymentSearch");
  if (paymentSearchInput) paymentSearchInput.addEventListener("input", loadPayments);

  const adminSearchInput = document.getElementById("adminSearch");
  if (adminSearchInput) adminSearchInput.addEventListener("input", renderAdminUsers);
}

// INIT
let today = new Date().toISOString().split("T")[0];

// Set today's date as default for date fields
if (document.getElementById("loanDate")) document.getElementById("loanDate").value = today;
if (document.getElementById("payDate")) document.getElementById("payDate").value = today;
if (document.getElementById("dateFilter")) document.getElementById("dateFilter").value = today;
