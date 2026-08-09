// ================= UTILITY FUNCTIONS =================

// VIEW MODAL FUNCTIONS
function openViewModal(title, content) {
  document.getElementById("viewModalTitle").innerText = title;
  document.getElementById("viewModalContent").innerHTML = content;
  document.getElementById("viewModal").style.display = "block";
}

function closeViewModal() {
  document.getElementById("viewModal").style.display = "none";
}

// ================= DATE FORMATTING =================
function formatDate(d) {
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, '0') + "-" +
    String(d.getDate()).padStart(2, '0');
}

// calculateLoanBalance() is defined in api.js (reads from backend balance cache)

// ================= VIEW FUNCTIONS =================

function viewCustomer(id) {
  let customer = customers.find(c => String(c.id) === String(id));
  if (!customer) return;

  let html = `
    <p><strong>Name:</strong> ${customer.name || ""}</p>
    <p><strong>Mobile:</strong> ${customer.mobile || ""}</p>
    <p><strong>Reference:</strong> ${customer.ref || ""}</p>
    <p><strong>PAN:</strong> ${customer.pan || ""}</p>
    <p><strong>Address:</strong> ${customer.address || ""}</p>
    <p><strong>Remark:</strong> ${customer.remark || ""}</p>
  `;

  // Add additional details if any
  let customerDetails = additionalDetails.filter(a => a.applicableTo.includes("Customer"));
  if (customerDetails.length > 0 && customer.additionalDetails) {
    html += `<hr style="margin: 15px 0;"><h4>Additional Details</h4>`;
    customerDetails.forEach(d => {
      let value = customer.additionalDetails[d.id] || "";
      html += `<p><strong>${d.title}:</strong> ${value}</p>`;
    });
  }

  openViewModal("Customer Details", html);
}

function viewLoan(id) {
  let loan = loans.find(l => l.id === id);
  if (!loan) return;

  let customer = customers.find(c => Number(c.id) === Number(loan.customerId));
  let loanMode = loan.loanMode || "Cash";
  let bankInfo = "", upiInfo = "";

  if (loanMode === "Bank" && loan.bankId) {
    let bank = banks.find(b => b.id === loan.bankId);
    bankInfo = bank ? `<p><strong>Bank:</strong> ${bank.name} - ${bank.accountNo}</p>` : "";
  } else if (loanMode === "UPI" && loan.upiId) {
    let upi = upiIds.find(u => u.id === loan.upiId);
    upiInfo = upi ? `<p><strong>UPI:</strong> ${upi.name} - ${upi.upiId}</p>` : "";
  }

  let html = `
    <p><strong>Loan ID:</strong> ${loan.loanNo || ""}</p>
    <p><strong>Customer:</strong> ${customer ? customer.name : "Unknown"}</p>
    <p><strong>Amount:</strong> ₹${loan.amount || ""}</p>
    <p><strong>Interest Rate:</strong> ${loan.rate || ""}%</p>
    <p><strong>Loan Date:</strong> ${loan.startDate || ""}</p>
    <p><strong>Period:</strong> ${(loan.period || "monthly").charAt(0).toUpperCase() + (loan.period || "monthly").slice(1)}</p>
    <p><strong>Transaction Mode:</strong> ${loanMode}</p>
    ${bankInfo}
    ${upiInfo}
  `;

  // Add additional details if any
  let loanDetails = additionalDetails.filter(a => a.applicableTo.includes("Loan"));
  if (loanDetails.length > 0 && loan.additionalDetails) {
    html += `<hr style="margin: 15px 0;"><h4>Additional Details</h4>`;
    loanDetails.forEach(d => {
      let value = loan.additionalDetails[d.id] || "";
      html += `<p><strong>${d.title}:</strong> ${value}</p>`;
    });
  }

  openViewModal("Loan Details", html);
}

function viewVendor(id) {
  let vendor = vendors.find(v => v.id === id);
  if (!vendor) return;

  let html = `
    <p><strong>Name:</strong> ${vendor.name || ""}</p>
    <p><strong>Mobile:</strong> ${vendor.mobile || ""}</p>
    <p><strong>Address:</strong> ${vendor.address || ""}</p>
  `;

  // Add additional details if any
  let vendorDetails = additionalDetails.filter(a => a.applicableTo.includes("Vendor"));
  if (vendorDetails.length > 0 && vendor.additionalDetails) {
    html += `<hr style="margin: 15px 0;"><h4>Additional Details</h4>`;
    vendorDetails.forEach(d => {
      let value = vendor.additionalDetails[d.id] || "";
      html += `<p><strong>${d.title}:</strong> ${value}</p>`;
    });
  }

  openViewModal("Vendor Details", html);
}

function viewBank(id) {
  let bank = banks.find(b => b.id === id);
  if (!bank) return;

  let html = `
    <p><strong>Name:</strong> ${bank.name || ""}</p>
    <p><strong>Account No:</strong> ${bank.accountNo || ""}</p>
    <p><strong>Account Holder:</strong> ${bank.accountHolder || ""}</p>
  `;

  openViewModal("Bank Details", html);
}

function viewUPI(id) {
  let upi = upiIds.find(u => u.id === id);
  if (!upi) return;

  let html = `
    <p><strong>Name:</strong> ${upi.name || ""}</p>
    <p><strong>UPI ID:</strong> ${upi.upiId || ""}</p>
  `;

  openViewModal("UPI Details", html);
}

function viewAdditionalDetail(id) {
  let detail = additionalDetails.find(a => a.id === id);
  if (!detail) return;

  let html = `
    <p><strong>Title:</strong> ${detail.title || ""}</p>
    <p><strong>Description:</strong> ${detail.description || ""}</p>
    <p><strong>Data Type:</strong> ${detail.dataType || "text"}</p>
    <p><strong>Applicable To:</strong> ${detail.applicableTo.join(", ")}</p>
  `;

  openViewModal("Additional Detail", html);
}
