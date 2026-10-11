// ================= APPLICATION INITIALIZATION AND NAVIGATION =================

const ROUTE_SECTIONS = ["dashboard", "master", "loan", "payment", "ledger", "passbook", "reports", "admin", "settings"];
const MASTER_TABS = ["customers", "vendors", "banks", "upi", "additionalDetails"];

function parseRoute(route = window.location.hash) {
  const hash = (route || "").replace(/^#/, "").replace(/^\/+/, "");
  const parts = hash.split("/").filter(Boolean);
  const section = parts[0] && ROUTE_SECTIONS.includes(parts[0]) ? parts[0] : "dashboard";
  const tab = section === "master" && parts[1] && MASTER_TABS.includes(parts[1]) ? parts[1] : null;
  return { section, tab };
}

function buildRoutePath(section, tab = null) {
  const safeSection = ROUTE_SECTIONS.includes(section) ? section : "dashboard";
  if (safeSection === "master" && tab && MASTER_TABS.includes(tab)) {
    return `#/master/${tab}`;
  }
  return `#/${safeSection}`;
}

function activateMasterTab(tabName = "customers") {
  const safeTab = MASTER_TABS.includes(tabName) ? tabName : "customers";

  document.querySelectorAll(".master-tab-content").forEach(tab => tab.classList.add("hidden"));
  const targetTab = document.getElementById(`master-${safeTab}`);
  if (targetTab) targetTab.classList.remove("hidden");

  document.querySelectorAll(".master-tab-btn").forEach(btn => btn.classList.remove("active"));
  const targetButton = document.querySelector(`.master-tab-btn[data-tab="${safeTab}"]`);
  if (targetButton) targetButton.classList.add("active");
}

function renderSection(id, tab = null) {
  const sectionId = ROUTE_SECTIONS.includes(id) ? id : "dashboard";

  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  const targetSection = document.getElementById(sectionId);
  if (targetSection) targetSection.classList.remove("hidden");

  if (sectionId === "admin") {
    loadAdminPanel();
  }

  // Clear all form fields when switching pages
  clearAllForms();

  // Render dynamic additional fields for each section
  if (sectionId === "loan") renderLoanAdditionalFields();
  if (sectionId === "customer") renderCustomerAdditionalFields();
  if (sectionId === "payment") {
    renderPaymentAdditionalFields();
    loadPayments();
  }
  if (sectionId === "master") {
    renderCustomerAdditionalFields();
    renderVendorAdditionalFields();
    activateMasterTab(tab || "customers");
  }
  if (sectionId === "dashboard") {
    updateDashboard();
  }
  if (sectionId === "passbook") {
    loadPassbookTransactors();
    if (document.getElementById("passbookDate")) {
      let today = new Date().toISOString().split('T')[0];
      document.getElementById("passbookDate").value = today;
    }
  }

  if (sectionId === "reports") {
    loadReports();
  }
}

function showSection(id, options = {}) {
  const sectionId = typeof id === "string" ? id : "dashboard";
  const tab = options && options.tab ? options.tab : null;

  if (options && options.skipRouteUpdate) {
    renderSection(sectionId, tab);
    return;
  }

  const nextRoute = buildRoutePath(sectionId, tab);
  if (window.location.hash !== nextRoute) {
    window.history.pushState({}, "", nextRoute);
  }
  renderSection(sectionId, tab);
}

function handleRouteChange() {
  const route = parseRoute(window.location.hash);
  renderSection(route.section, route.tab);
}

function initializeRouting() {
  const route = parseRoute(window.location.hash);
  const fallbackRoute = buildRoutePath(route.section, route.tab);

  if (!window.location.hash) {
    window.history.replaceState({}, "", fallbackRoute);
  }

  handleRouteChange();
}

window.addEventListener("popstate", handleRouteChange);
window.addEventListener("hashchange", handleRouteChange);
document.addEventListener("DOMContentLoaded", initializeRouting);

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
