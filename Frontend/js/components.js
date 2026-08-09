// ================= FIRESTORE DATA ARRAYS =================
let customers = [];
let loans = [];
let payments = [];
let interestLogs = [];
let vendors = [];
let banks = [];
let upiIds = [];
let additionalDetails = [];
let passbookEntries = [];

// Debounce timer for updateDashboard
let updateDashboardTimer = null;

// ================= COMPONENT FUNCTIONS =================

// POPULATE BANK DROPDOWN
function populateBankDropdown(selectId) {
  let selectEl = document.getElementById(selectId);
  if (!selectEl) return;

  selectEl.innerHTML = '<option value="">-- Select Bank --</option>' +
    banks.map(b => `<option value="${b.id}">${b.name} (${b.account})</option>`).join("");
}

// POPULATE UPI DROPDOWN
function populateUPIDropdown(selectId) {
  let selectEl = document.getElementById(selectId);
  if (!selectEl) return;

  selectEl.innerHTML = '<option value="">-- Select UPI ID --</option>' +
    upiIds.map(u => `<option value="${u.id}">${u.name} - ${u.upiId}</option>`).join("");
}

// UPDATE LOAN BANK/UPI FIELDS
function updateLoanBankUPI() {
  let mode = document.getElementById("loanMode").value;
  document.getElementById("loanBankGroup").style.display = mode === "Bank" ? "flex" : "none";
  document.getElementById("loanUPIGroup").style.display = mode === "UPI" ? "flex" : "none";
  populateBankDropdown("loanBank");
  populateUPIDropdown("loanUPI");
}

// UPDATE PAYMENT BANK/UPI FIELDS
function updatePaymentBankUPI() {
  let mode = document.getElementById("paymentMode").value;
  document.getElementById("paymentBankGroup").style.display = mode === "Bank" ? "flex" : "none";
  document.getElementById("paymentUPIGroup").style.display = mode === "UPI" ? "flex" : "none";
  populateBankDropdown("paymentBank");
  populateUPIDropdown("paymentUPI");
}

// CLEAR ALL FORMS
function clearAllForms() {
  // Customer fields (both Master and Customer sections)
  if (document.getElementById("cname")) document.getElementById("cname").value = "";
  if (document.getElementById("cmobile")) document.getElementById("cmobile").value = "";
  if (document.getElementById("cref")) document.getElementById("cref").value = "";
  if (document.getElementById("cpan")) document.getElementById("cpan").value = "";
  if (document.getElementById("cagreement")) document.getElementById("cagreement").value = "";
  if (document.getElementById("caddress")) document.getElementById("caddress").value = "";
  if (document.getElementById("cremark")) document.getElementById("cremark").value = "";

  // Master section customer fields
  if (document.getElementById("master_cname")) document.getElementById("master_cname").value = "";
  if (document.getElementById("master_cmobile")) document.getElementById("master_cmobile").value = "";
  if (document.getElementById("master_cref")) document.getElementById("master_cref").value = "";
  if (document.getElementById("master_cpan")) document.getElementById("master_cpan").value = "";
  if (document.getElementById("master_cagreement")) document.getElementById("master_cagreement").value = "";
  if (document.getElementById("master_caddress")) document.getElementById("master_caddress").value = "";
  if (document.getElementById("master_cremark")) document.getElementById("master_cremark").value = "";

  // Loan fields
  if (document.getElementById("loanCustomer")) document.getElementById("loanCustomer").value = "";
  if (document.getElementById("amount")) document.getElementById("amount").value = "";
  if (document.getElementById("rate")) document.getElementById("rate").value = "";
  if (document.getElementById("loanMode")) document.getElementById("loanMode").value = "Cash";
  if (document.getElementById("loanDate")) {
    document.getElementById("loanDate").value = new Date().toISOString().split("T")[0];
  }
  if (document.getElementById("period")) document.getElementById("period").value = "monthly";
  if (document.getElementById("loanBank")) document.getElementById("loanBank").value = "";
  if (document.getElementById("loanUPI")) document.getElementById("loanUPI").value = "";

  // Payment fields
  if (document.getElementById("payLoan")) document.getElementById("payLoan").value = "";
  if (document.getElementById("payAmount")) document.getElementById("payAmount").value = "";
  if (document.getElementById("payDate")) {
    document.getElementById("payDate").value = new Date().toISOString().split("T")[0];
  }
  if (document.getElementById("paymentMode")) document.getElementById("paymentMode").value = "Cash";
  if (document.getElementById("paymentBank")) document.getElementById("paymentBank").value = "";
  if (document.getElementById("paymentUPI")) document.getElementById("paymentUPI").value = "";

  // Vendor fields
  if (document.getElementById("vname")) document.getElementById("vname").value = "";
  if (document.getElementById("vmobile")) document.getElementById("vmobile").value = "";
  if (document.getElementById("vemail")) document.getElementById("vemail").value = "";
  if (document.getElementById("vcompany")) document.getElementById("vcompany").value = "";
  if (document.getElementById("vgst")) document.getElementById("vgst").value = "";
  if (document.getElementById("vaddress")) document.getElementById("vaddress").value = "";

  // Bank fields
  if (document.getElementById("bname")) document.getElementById("bname").value = "";
  if (document.getElementById("baccount")) document.getElementById("baccount").value = "";
  if (document.getElementById("bifsc")) document.getElementById("bifsc").value = "";
  if (document.getElementById("bholder")) document.getElementById("bholder").value = "";
  if (document.getElementById("bbranch")) document.getElementById("bbranch").value = "";
  if (document.getElementById("bremark")) document.getElementById("bremark").value = "";

  // UPI fields
  if (document.getElementById("upiid")) document.getElementById("upiid").value = "";
  if (document.getElementById("upiname")) document.getElementById("upiname").value = "";
  if (document.getElementById("upimobile")) document.getElementById("upimobile").value = "";
  if (document.getElementById("upiprovider")) document.getElementById("upiprovider").value = "";
  if (document.getElementById("upiremarks")) document.getElementById("upiremarks").value = "";

  // Additional Details fields
  if (document.getElementById("adTitle")) document.getElementById("adTitle").value = "";
  if (document.getElementById("adDescription")) document.getElementById("adDescription").value = "";
  document.querySelectorAll('input[name="applicableTo"]').forEach(cb => cb.checked = false);

  // Reset editing states
  editingCustomerId = null;
  editingLoanId = null;
  // Reset buttons in all sections
  document.querySelectorAll(".primary-btn").forEach(btn => {
    if (btn.innerText.includes("Save Changes")) {
      btn.innerText = btn.getAttribute("data-default-text") || "Add Customer";
    }
  });
  if (document.querySelector("#customer .primary-btn")) {
    document.querySelector("#customer .primary-btn").innerText = "Add Customer";
  }
  if (document.querySelector("#loan .primary-btn")) {
    document.querySelector("#loan .primary-btn").innerText = "Add Loan";
  }
  if (document.querySelector("#master-customers .primary-btn")) {
    document.querySelector("#master-customers .primary-btn").innerText = "Add Customer";
  }

  // Clear all file input fields
  document.querySelectorAll('input[type="file"]').forEach(fileInput => {
    fileInput.value = "";
  });

  // Clear all textarea fields
  document.querySelectorAll('textarea').forEach(textarea => {
    textarea.value = "";
  });

  // Clear passbook fields
  if (document.getElementById("passbookVendor")) document.getElementById("passbookVendor").value = "";
  if (document.getElementById("passbookDate")) {
    document.getElementById("passbookDate").value = new Date().toISOString().split("T")[0];
  }
  if (document.getElementById("passbookAmountIn")) document.getElementById("passbookAmountIn").value = "";
  if (document.getElementById("passbookAmountOut")) document.getElementById("passbookAmountOut").value = "";
  if (document.getElementById("passbookRemarks")) document.getElementById("passbookRemarks").value = "";

  // Hide bank/UPI fields
  if (document.getElementById("loanBankGroup")) document.getElementById("loanBankGroup").style.display = "none";
  if (document.getElementById("loanUPIGroup")) document.getElementById("loanUPIGroup").style.display = "none";
  if (document.getElementById("paymentBankGroup")) document.getElementById("paymentBankGroup").style.display = "none";
  if (document.getElementById("paymentUPIGroup")) document.getElementById("paymentUPIGroup").style.display = "none";
}

// TOGGLE ADDITIONAL DETAILS
function toggleAdditionalDetails(type) {
  let container = document.getElementById(type + "AdditionalFields");
  if (!container) return;

  if (container.style.display === "none") {
    container.style.display = "block";
  } else {
    container.style.display = "none";
  }
}

// RENDER DYNAMIC ADDITIONAL FIELDS
function renderLoanAdditionalFields() {
  let container = document.getElementById("loanAdditionalFields");
  if (!container) return;

  let loanDetails = additionalDetails.filter(a => a.applicableTo.includes("Loan"));
  if (loanDetails.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div style="margin-top: 20px; padding: 15px; background: #f0f8ff; border-radius: 6px;">
      <h4 style="margin-top: 0; color: var(--primary);">Additional Details</h4>
      <div class="form-row">
        ${loanDetails.map(d => {
    let inputHTML = '';
    if (d.dataType === 'textarea') {
      inputHTML = `<textarea id="loan-ad-${d.id}" placeholder="${d.description}" style="height: 60px; resize: vertical;"></textarea>`;
    } else if (d.dataType === 'date') {
      inputHTML = `<input type="date" id="loan-ad-${d.id}" placeholder="${d.description}">`;
    } else if (d.dataType === 'number') {
      inputHTML = `<input type="number" id="loan-ad-${d.id}" placeholder="${d.description}">`;
    } else if (d.dataType === 'email') {
      inputHTML = `<input type="email" id="loan-ad-${d.id}" placeholder="${d.description}">`;
    } else if (d.dataType === 'tel') {
      inputHTML = `<input type="tel" id="loan-ad-${d.id}" placeholder="${d.description}">`;
    } else {
      inputHTML = `<input type="text" id="loan-ad-${d.id}" placeholder="${d.description}">`;
    }
    return `
            <div class="form-group">
              <label>${d.title}</label>
              ${inputHTML}
            </div>
          `;
  }).join("")}
      </div>
    </div>
  `;
}

function renderCustomerAdditionalFields() {
  let container = document.getElementById("customerAdditionalFields");
  if (!container) return;

  let customerDetails = additionalDetails.filter(a => a.applicableTo.includes("Customer"));
  if (customerDetails.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div style="margin-top: 20px; padding: 15px; background: #f0f8ff; border-radius: 6px;">
      <h4 style="margin-top: 0; color: var(--primary);">Additional Details</h4>
      <div class="form-row">
        ${customerDetails.map(d => {
    let inputHTML = '';
    if (d.dataType === 'textarea') {
      inputHTML = `<textarea id="customer-ad-${d.id}" placeholder="${d.description}" style="height: 60px; resize: vertical;"></textarea>`;
    } else if (d.dataType === 'date') {
      inputHTML = `<input type="date" id="customer-ad-${d.id}" placeholder="${d.description}">`;
    } else if (d.dataType === 'number') {
      inputHTML = `<input type="number" id="customer-ad-${d.id}" placeholder="${d.description}">`;
    } else if (d.dataType === 'email') {
      inputHTML = `<input type="email" id="customer-ad-${d.id}" placeholder="${d.description}">`;
    } else if (d.dataType === 'tel') {
      inputHTML = `<input type="tel" id="customer-ad-${d.id}" placeholder="${d.description}">`;
    } else {
      inputHTML = `<input type="text" id="customer-ad-${d.id}" placeholder="${d.description}">`;
    }
    return `
            <div class="form-group">
              <label>${d.title}</label>
              ${inputHTML}
            </div>
          `;
  }).join("")}
      </div>
    </div>
  `;
}

function renderPaymentAdditionalFields() {
  let container = document.getElementById("paymentAdditionalFields");
  if (!container) return;

  let paymentDetails = additionalDetails.filter(a => a.applicableTo.includes("Payment"));
  if (paymentDetails.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div style="margin-top: 20px; padding: 15px; background: #f0f8ff; border-radius: 6px;">
      <h4 style="margin-top: 0; color: var(--primary);">Additional Details</h4>
      <div class="form-row">
        ${paymentDetails.map(d => {
    let inputHTML = '';
    if (d.dataType === 'textarea') {
      inputHTML = `<textarea id="payment-ad-${d.id}" placeholder="${d.description}" style="height: 60px; resize: vertical;"></textarea>`;
    } else if (d.dataType === 'date') {
      inputHTML = `<input type="date" id="payment-ad-${d.id}" placeholder="${d.description}">`;
    } else if (d.dataType === 'number') {
      inputHTML = `<input type="number" id="payment-ad-${d.id}" placeholder="${d.description}">`;
    } else if (d.dataType === 'email') {
      inputHTML = `<input type="email" id="payment-ad-${d.id}" placeholder="${d.description}">`;
    } else if (d.dataType === 'tel') {
      inputHTML = `<input type="tel" id="payment-ad-${d.id}" placeholder="${d.description}">`;
    } else {
      inputHTML = `<input type="text" id="payment-ad-${d.id}" placeholder="${d.description}">`;
    }
    return `
            <div class="form-group">
              <label>${d.title}</label>
              ${inputHTML}
            </div>
          `;
  }).join("")}
      </div>
    </div>
  `;
}

function renderVendorAdditionalFields() {
  let container = document.getElementById("vendorAdditionalFields");
  if (!container) return;

  let vendorDetails = additionalDetails.filter(a => a.applicableTo.includes("Vendor"));
  if (vendorDetails.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div style="margin-top: 20px; padding: 15px; background: #f0f8ff; border-radius: 6px;">
      <h4 style="margin-top: 0; color: var(--primary);">Additional Details</h4>
      <div class="form-row">
        ${vendorDetails.map(d => {
    let inputHTML = '';
    if (d.dataType === 'textarea') {
      inputHTML = `<textarea id="vendor-ad-${d.id}" placeholder="${d.description}" style="height: 60px; resize: vertical;"></textarea>`;
    } else if (d.dataType === 'date') {
      inputHTML = `<input type="date" id="vendor-ad-${d.id}" placeholder="${d.description}">`;
    } else if (d.dataType === 'number') {
      inputHTML = `<input type="number" id="vendor-ad-${d.id}" placeholder="${d.description}">`;
    } else if (d.dataType === 'email') {
      inputHTML = `<input type="email" id="vendor-ad-${d.id}" placeholder="${d.description}">`;
    } else if (d.dataType === 'tel') {
      inputHTML = `<input type="tel" id="vendor-ad-${d.id}" placeholder="${d.description}">`;
    } else {
      inputHTML = `<input type="text" id="vendor-ad-${d.id}" placeholder="${d.description}">`;
    }
    return `
            <div class="form-group">
              <label>${d.title}</label>
              ${inputHTML}
            </div>
          `;
  }).join("")}
      </div>
    </div>
  `;
}
