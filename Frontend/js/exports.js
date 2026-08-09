// ================= EXPORT FUNCTIONS =================

// CUSTOMER EXPORTS
function exportCustomersToExcel() {
  let data = customers.map(c => ({
    Name: c.name,
    Mobile: c.mobile,
    Reference: c.ref,
    PAN: c.pan,
    Address: c.address,
    Remark: c.remark,
    Status: c.locked ? "Locked" : "Active"
  }));

  let worksheet = XLSX.utils.json_to_sheet(data);
  let workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
  XLSX.writeFile(workbook, "Customers_" + new Date().toISOString().slice(0, 10) + ".xlsx");
}

function exportCustomersToPDF() {
  const doc = new jsPDF();
  doc.text("Customers Report", 14, 15);
  doc.setFontSize(10);

  let data = customers.map(c => [
    c.name,
    c.mobile,
    c.ref,
    c.pan,
    c.address,
    c.locked ? "Locked" : "Active"
  ]);

  doc.autoTable({
    head: [["Name", "Mobile", "Reference", "PAN", "Address", "Status"]],
    body: data,
    startY: 25,
    styles: { fontSize: 9, cellPadding: 3 }
  });

  doc.save("Customers_" + new Date().toISOString().slice(0, 10) + ".pdf");
}

// VENDOR EXPORTS
function exportVendorsToExcel() {
  let data = vendors.map(v => ({
    "Vendor Name": v.name,
    Mobile: v.mobile,
    Email: v.email,
    Company: v.company,
    GST: v.gst,
    Address: v.address,
    Status: v.locked ? "Locked" : "Active"
  }));

  let worksheet = XLSX.utils.json_to_sheet(data);
  let workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Vendors");
  XLSX.writeFile(workbook, "Vendors_" + new Date().toISOString().slice(0, 10) + ".xlsx");
}

function exportVendorsToPDF() {
  const doc = new jsPDF();
  doc.text("Vendors Report", 14, 15);
  doc.setFontSize(10);

  let data = vendors.map(v => [
    v.name,
    v.mobile,
    v.email,
    v.company,
    v.gst,
    v.locked ? "Locked" : "Active"
  ]);

  doc.autoTable({
    head: [["Vendor Name", "Mobile", "Email", "Company", "GST", "Status"]],
    body: data,
    startY: 25,
    styles: { fontSize: 9, cellPadding: 3 }
  });

  doc.save("Vendors_" + new Date().toISOString().slice(0, 10) + ".pdf");
}

// LOAN EXPORTS
function exportLoansToExcel() {
  let data = loans.map(l => {
    let customer = customers.find(c => Number(c.id) === Number(l.customerId));
    let balance = calculateLoanBalance(l.id);
    return {
      "Loan ID": l.loanNo,
      Customer: customer ? customer.name : "Unknown",
      "Mobile": customer ? customer.mobile : "",
      Amount: l.amount,
      "Interest Rate": l.rate + "%",
      Period: l.period,
      "Start Date": l.startDate,
      Balance: Math.round(balance),
      Status: l.locked ? "Locked" : "Active"
    };
  });

  let worksheet = XLSX.utils.json_to_sheet(data);
  let workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Loans");
  XLSX.writeFile(workbook, "Loans_" + new Date().toISOString().slice(0, 10) + ".xlsx");
}

function exportLoansToPDF() {
  const doc = new jsPDF();
  doc.text("Loans Report", 14, 15);
  doc.setFontSize(10);

  let data = loans.map(l => {
    let customer = customers.find(c => Number(c.id) === Number(l.customerId));
    let balance = calculateLoanBalance(l.id);
    return [
      l.loanNo,
      customer ? customer.name : "Unknown",
      l.amount,
      l.rate + "%",
      l.period,
      Math.round(balance),
      l.locked ? "Locked" : "Active"
    ];
  });

  doc.autoTable({
    head: [["Loan ID", "Customer", "Amount", "Rate", "Period", "Balance", "Status"]],
    body: data,
    startY: 25,
    styles: { fontSize: 9, cellPadding: 3 }
  });

  doc.save("Loans_" + new Date().toISOString().slice(0, 10) + ".pdf");
}

// PAYMENT EXPORTS
function exportPaymentsToExcel() {
  let data = payments.map(p => {
    let loan = loans.find(l => l.id === p.loanId);
    let customer = loan ? customers.find(c => Number(c.id) === Number(loan.customerId)) : null;
    return {
      "Loan ID": loan ? loan.loanNo : "Unknown",
      Customer: customer ? customer.name : "Unknown",
      Amount: p.amount,
      Date: p.date,
      Mode: p.paymentMode,
      Status: "Completed"
    };
  });

  let worksheet = XLSX.utils.json_to_sheet(data);
  let workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
  XLSX.writeFile(workbook, "Payments_" + new Date().toISOString().slice(0, 10) + ".xlsx");
}

function exportPaymentsToPDF() {
  const doc = new jsPDF();
  doc.text("Payments Report", 14, 15);
  doc.setFontSize(10);

  let data = payments.map(p => {
    let loan = loans.find(l => l.id === p.loanId);
    let customer = loan ? customers.find(c => Number(c.id) === Number(loan.customerId)) : null;
    return [
      loan ? loan.loanNo : "Unknown",
      customer ? customer.name : "Unknown",
      p.amount,
      p.date,
      p.paymentMode
    ];
  });

  doc.autoTable({
    head: [["Loan ID", "Customer", "Amount", "Date", "Mode"]],
    body: data,
    startY: 25,
    styles: { fontSize: 9, cellPadding: 3 }
  });

  doc.save("Payments_" + new Date().toISOString().slice(0, 10) + ".pdf");
}

// PASSBOOK EXPORTS
function exportPassbookToExcel() {
  let vendorId = parseInt(document.getElementById("passbookVendor").value);
  let vendor = vendors.find(v => v.id === vendorId);

  if (!vendor) {
    alert("Please select a vendor");
    return;
  }

  let entries = passbookEntries.filter(e => e.vendorId === vendorId);
  entries.sort((a, b) => new Date(a.date) - new Date(b.date));

  let runningIn = 0;
  let runningOut = 0;
  
  entries.forEach(entry => {
    runningIn += entry.amountIn;
    runningOut += entry.amountOut;
    entry.computedBalance = runningIn - runningOut;
  });

  let data = entries.map(e => ({
    Date: e.date,
    "Amount In": e.amountIn,
    "Amount Out": e.amountOut,
    Balance: Math.round(e.computedBalance),
    Remarks: e.remarks || ""
  }));

  let worksheet = XLSX.utils.json_to_sheet(data);
  let workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Passbook");
  XLSX.writeFile(workbook, "Passbook_" + vendor.name + "_" + new Date().toISOString().slice(0, 10) + ".xlsx");
}

function exportPassbookToPDF() {
  let vendorId = parseInt(document.getElementById("passbookVendor").value);
  let vendor = vendors.find(v => v.id === vendorId);

  if (!vendor) {
    alert("Please select a vendor");
    return;
  }

  const doc = new jsPDF();
  doc.text("Passbook: " + vendor.name, 14, 15);
  doc.setFontSize(10);

  let entries = passbookEntries.filter(e => e.vendorId === vendorId);
  entries.sort((a, b) => new Date(a.date) - new Date(b.date));

  let runningIn = 0;
  let runningOut = 0;
  
  let data = entries.map(e => {
    runningIn += e.amountIn;
    runningOut += e.amountOut;
    let balance = runningIn - runningOut;
    return [
      e.date,
      e.amountIn,
      e.amountOut,
      Math.round(balance),
      e.remarks || ""
    ];
  });

  doc.autoTable({
    head: [["Date", "In", "Out", "Balance", "Remarks"]],
    body: data,
    startY: 25,
    styles: { fontSize: 9, cellPadding: 3 }
  });

  doc.save("Passbook_" + vendor.name + "_" + new Date().toISOString().slice(0, 10) + ".pdf");
}
