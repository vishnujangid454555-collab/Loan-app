// ================= REPORTS SECTION =================

let currentReportKey = "loanReport";

const reportDefinitions = {
  loanReport: {
    name: "Loan Report",
    filters: [
      { key: "customerId", label: "Customer", type: "customer" },
      { key: "fromDate", label: "From Date", type: "date" },
      { key: "toDate", label: "To Date", type: "date" },
      { key: "search", label: "Search", type: "search" },
    ],
    columns: [
      { label: "Loan ID", field: "loanNo" },
      { label: "Customer", field: "customer" },
      { label: "Loan Amount", field: "amountFormatted" },
      { label: "Interest Rate", field: "rateFormatted" },
      { label: "Loan Date", field: "startDateFormatted" },
      { label: "Total Paid", field: "totalPaidFormatted" },
      { label: "Outstanding", field: "outstandingFormatted" },
      { label: "Status", field: "status" },
    ],
    summary: (rows) => [
      { label: "Total Loans", value: rows.length },
      { label: "Active Loans", value: rows.filter((row) => row.status === "Active").length },
      { label: "Closed Loans", value: rows.filter((row) => row.status === "Closed").length },
      { label: "Total Loan Amount", value: formatCurrencyINR(rows.reduce((sum, row) => sum + row.amount, 0)) },
      { label: "Total Outstanding", value: formatCurrencyINR(rows.reduce((sum, row) => sum + row.outstanding, 0)) },
    ],
  },
  disbursementReport: {
    name: "Disbursement Report",
    filters: [
      { key: "customerId", label: "Customer", type: "customer" },
      { key: "fromDate", label: "From Date", type: "date" },
      { key: "toDate", label: "To Date", type: "date" },
      { key: "search", label: "Search", type: "search" },
    ],
    columns: [
      { label: "Disbursement Date", field: "startDateFormatted" },
      { label: "Customer", field: "customer" },
      { label: "Loan ID", field: "loanNo" },
      { label: "Loan Amount", field: "amountFormatted" },
      { label: "Disbursement Mode", field: "disbursementMode" },
      { label: "Status", field: "status" },
    ],
    summary: (rows) => [
      { label: "Total Disbursements", value: rows.length },
      { label: "Total Disbursed", value: formatCurrencyINR(rows.reduce((sum, row) => sum + row.amount, 0)) },
    ],
  },
  collectionReport: {
    name: "Collection Report",
    filters: [
      { key: "customerId", label: "Customer", type: "customer" },
      { key: "loanId", label: "Loan", type: "loan" },
      { key: "fromDate", label: "From Date", type: "date" },
      { key: "toDate", label: "To Date", type: "date" },
      { key: "search", label: "Search", type: "search" },
    ],
    columns: [
      { label: "Collection Date", field: "dateFormatted" },
      { label: "Customer", field: "customer" },
      { label: "Loan ID", field: "loanNo" },
      { label: "Amount", field: "amountFormatted" },
      { label: "Payment Mode", field: "paymentMode" },
      { label: "Status", field: "status" },
    ],
    summary: (rows) => [
      { label: "Total Collections", value: rows.length },
      { label: "Total Amount Collected", value: formatCurrencyINR(rows.reduce((sum, row) => sum + row.amount, 0)) },
    ],
  },
  outstandingReport: {
    name: "Outstanding Report",
    filters: [
      { key: "customerId", label: "Customer", type: "customer" },
      { key: "status", label: "Loan Status", type: "status" },
      { key: "search", label: "Search", type: "search" },
    ],
    columns: [
      { label: "Customer", field: "customer" },
      { label: "Loan ID", field: "loanNo" },
      { label: "Principal Outstanding", field: "amountFormatted" },
      { label: "Outstanding", field: "outstandingFormatted" },
      { label: "Loan Date", field: "startDateFormatted" },
      { label: "Status", field: "status" },
    ],
    summary: (rows) => [
      { label: "Loans Outstanding", value: rows.length },
      { label: "Total Outstanding", value: formatCurrencyINR(rows.reduce((sum, row) => sum + row.outstanding, 0)) },
      { label: "Average Outstanding", value: rows.length ? formatCurrencyINR(rows.reduce((sum, row) => sum + row.outstanding, 0) / rows.length) : formatCurrencyINR(0) },
    ],
  },
  overdueReport: {
    name: "Overdue / Default Report",
    filters: [
      { key: "customerId", label: "Customer", type: "customer" },
      { key: "loanId", label: "Loan", type: "loan" },
      { key: "search", label: "Search", type: "search" },
    ],
    columns: [
      { label: "Customer", field: "customer" },
      { label: "Loan ID", field: "loanNo" },
      { label: "Last Payment", field: "lastPaymentDateFormatted" },
      { label: "Days Since Last Payment", field: "daysSinceLastPayment" },
      { label: "Outstanding", field: "outstandingFormatted" },
      { label: "Status", field: "status" },
    ],
    summary: (rows) => [
      { label: "Overdue Loans", value: rows.length },
      { label: "Total Overdue", value: formatCurrencyINR(rows.reduce((sum, row) => sum + row.outstanding, 0)) },
    ],
  },
  customerStatement: {
    name: "Customer Statement",
    filters: [
      { key: "customerId", label: "Customer", type: "customer" },
      { key: "fromDate", label: "From Date", type: "date" },
      { key: "toDate", label: "To Date", type: "date" },
      { key: "search", label: "Search", type: "search" },
    ],
    columns: [
      { label: "Date", field: "date" },
      { label: "Loan ID", field: "loanNo" },
      { label: "Type", field: "type" },
      { label: "Amount", field: "amountFormatted" },
      { label: "Balance", field: "balanceFormatted" },
    ],
    summary: (rows) => [
      { label: "Statement Entries", value: rows.length },
      { label: "Closing Balance", value: rows.length ? rows[rows.length - 1].balanceFormatted : formatCurrencyINR(0) },
      { label: "Total Amount", value: formatCurrencyINR(rows.reduce((sum, row) => sum + Number(row.amount || 0), 0)) },
    ],
  },
  profitReport: {
    name: "Profit / Interest Report",
    filters: [
      { key: "customerId", label: "Customer", type: "customer" },
      { key: "loanId", label: "Loan", type: "loan" },
      { key: "fromDate", label: "From Date", type: "date" },
      { key: "toDate", label: "To Date", type: "date" },
      { key: "search", label: "Search", type: "search" },
    ],
    columns: [
      { label: "Date", field: "dateFormatted" },
      { label: "Customer", field: "customer" },
      { label: "Loan ID", field: "loanNo" },
      { label: "Interest Amount", field: "interestFormatted" },
      { label: "Rate", field: "rateFormatted" },
    ],
    summary: (rows) => [
      { label: "Interest Entries", value: rows.length },
      { label: "Total Interest", value: formatCurrencyINR(rows.reduce((sum, row) => sum + row.interest, 0)) },
    ],
  },
};

function loadReports() {
  renderReportTabs();
  selectReport(currentReportKey);
}

function renderReportTabs() {
  const nav = document.getElementById("reportNav");
  if (!nav) return;

  nav.innerHTML = Object.keys(reportDefinitions)
    .map((key) => {
      const report = reportDefinitions[key];
      const active = key === currentReportKey ? "active" : "";
      return `<button type="button" class="report-tab-btn ${active}" onclick="selectReport('${key}')">${report.name}</button>`;
    })
    .join("");
}

function selectReport(reportKey) {
  currentReportKey = reportKey;
  renderReportTabs();
  renderReportFilters();
  loadReportData();
}

function renderReportFilters() {
  const filterGroup = document.getElementById("reportFilterGroup");
  const report = reportDefinitions[currentReportKey];
  if (!filterGroup || !report) return;

  filterGroup.innerHTML = report.filters
    .map((filter) => {
      const filterId = `report_${currentReportKey}_${filter.key}`;
      let control = "";

      if (filter.type === "date") {
        control = `<input id="${filterId}" type="date" onchange="loadReportData()">`;
      } else if (filter.type === "customer") {
        control = `<select id="${filterId}" onchange="loadReportData()"><option value="">All Customers</option>${customers
          .map((c) => `<option value="${c.id}">${c.name}</option>`)
          .join("")}</select>`;
      } else if (filter.type === "loan") {
        control = `<select id="${filterId}" onchange="loadReportData()"><option value="">All Loans</option>${loans
          .map((loan) => {
            const customer = customers.find((c) => String(c.id) === String(loan.customerId));
            return `<option value="${loan.id}">${customer ? customer.name : "Unknown"} - #${String(loan.loanNo || loan.id).padStart(3, "0")}</option>`;
          })
          .join("")}</select>`;
      } else {
        control = `<input id="${filterId}" type="text" placeholder="Search" oninput="loadReportData()">`;
      }

      return `
        <div class="report-filter-item">
          <label for="${filterId}">${filter.label}</label>
          ${control}
        </div>
      `;
    })
    .join("");
}

function getReportFilters() {
  const report = reportDefinitions[currentReportKey];
  const values = {};
  if (!report) return values;

  report.filters.forEach((filter) => {
    const element = document.getElementById(`report_${currentReportKey}_${filter.key}`);
    if (!element) return;
    values[filter.key] = element.value || "";
  });

  return values;
}

async function loadReportData() {
  const tableHead = document.getElementById("reportTableHead");
  const tableBody = document.getElementById("reportTableBody");
  const reportSummary = document.getElementById("reportSummary");
  const reportEmpty = document.getElementById("reportEmpty");
  const reportControls = document.getElementById("reportControls");

  if (!tableHead || !tableBody || !reportSummary || !reportEmpty || !reportControls) return;

  reportControls.classList.remove("hidden");
  reportEmpty.style.display = "none";
  tableHead.innerHTML = "";
  tableBody.innerHTML = `<tr><td colspan="${reportDefinitions[currentReportKey].columns.length}">Loading report...</td></tr>`;
  reportSummary.innerHTML = "";

  try {
    const filters = getReportFilters();
    const rows = await generateReportRows(currentReportKey, filters);

    if (rows.length === 0) {
      renderReportColumns();
      tableBody.innerHTML = `<tr><td colspan="${reportDefinitions[currentReportKey].columns.length}">No records found for the selected criteria.</td></tr>`;
      reportEmpty.innerText = "No matching data was found. Adjust filters or select a different report.";
      reportEmpty.style.display = "block";
      renderReportSummary([]);
      return;
    }

    reportEmpty.style.display = "none";
    renderReportColumns();
    renderReportRows(rows);
    renderReportSummary(rows);
  } catch (error) {
    tableHead.innerHTML = "";
    tableBody.innerHTML = `<tr><td colspan="${reportDefinitions[currentReportKey].columns.length}">Error loading report: ${error.message || error}</td></tr>`;
    reportSummary.innerHTML = "";
  }
}

function renderReportColumns() {
  const tableHead = document.getElementById("reportTableHead");
  const report = reportDefinitions[currentReportKey];
  if (!tableHead || !report) return;

  tableHead.innerHTML = `<tr>${report.columns.map((col) => `<th>${col.label}</th>`).join("")}</tr>`;
}

function renderReportRows(rows) {
  const tableBody = document.getElementById("reportTableBody");
  const report = reportDefinitions[currentReportKey];
  if (!tableBody || !report) return;

  tableBody.innerHTML = rows
    .map((row) => {
      return `<tr>${report.columns
        .map((col) => `<td>${row[col.field] !== undefined && row[col.field] !== null ? row[col.field] : ""}</td>`)
        .join("")}</tr>`;
    })
    .join("");
}

function renderReportSummary(rows) {
  const reportSummary = document.getElementById("reportSummary");
  const report = reportDefinitions[currentReportKey];
  if (!reportSummary || !report) return;

  const cards = report.summary(rows).map((item) => {
    return `
      <div class="report-stat-card">
        <div class="report-stat-label">${item.label}</div>
        <div class="report-stat-value">${item.value}</div>
      </div>
    `;
  });

  reportSummary.innerHTML = cards.join("");
}

async function generateReportRows(reportKey, filters) {
  const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
  const toDate = filters.toDate ? new Date(filters.toDate) : null;
  const customerFilter = filters.customerId ? String(filters.customerId) : "";
  const loanFilter = filters.loanId ? String(filters.loanId) : "";
  const statusFilter = filters.status ? String(filters.status) : "";
  const searchText = filters.search ? filters.search.toLowerCase() : "";

  const loanRows = loans.map((loan) => {
    const customer = customers.find((c) => String(c.id) === String(loan.customerId));
    const outstanding = calculateLoanBalance(loan.id);
    const totalPaid = payments
      .filter((payment) => String(payment.loanId) === String(loan.id))
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const interestEarned = interestLogs
      .filter((interest) => String(interest.loanId) === String(loan.id))
      .reduce((sum, interest) => sum + Number(interest.amount || 0), 0);

    return {
      loanId: String(loan.id),
      loanNo: `#${String(loan.loanNo || loan.id).padStart(3, "0")}`,
      customer: customer ? customer.name : "Unknown",
      customerId: customer ? String(customer.id) : "",
      amount: Number(loan.amount || 0),
      amountFormatted: formatCurrencyINR(loan.amount),
      rateFormatted: `${loan.rate || 0}%`,
      startDateFormatted: formatDateDisplay(loan.startDate),
      totalPaid: totalPaid,
      totalPaidFormatted: formatCurrencyINR(totalPaid),
      interestEarned: interestEarned,
      interestEarnedFormatted: formatCurrencyINR(interestEarned),
      outstanding: outstanding,
      outstandingFormatted: formatCurrencyINR(outstanding),
      status: loan.locked ? "Locked" : outstanding <= 0 ? "Closed" : "Active",
      disbursementMode: loan.loanMode || "Cash",
      date: loan.startDate,
      lastPaymentDate: getLastPaymentDate(loan.id),
      lastPaymentDateFormatted: getLastPaymentDate(loan.id) ? formatDateDisplay(getLastPaymentDate(loan.id)) : "N/A",
      daysSinceLastPayment: getDaysSinceDate(getLastPaymentDate(loan.id) || loan.startDate),
    };
  });

  const paymentRows = payments.map((payment, index) => {
    const loan = loans.find((l) => String(l.id) === String(payment.loanId));
    const customer = loan ? customers.find((c) => String(c.id) === String(loan.customerId)) : null;

    return {
      paymentIndex: index + 1,
      loanId: loan ? String(loan.id) : "",
      loanNo: loan ? `#${String(loan.loanNo || loan.id).padStart(3, "0")}` : "Unknown",
      customer: customer ? customer.name : "Unknown",
      customerId: customer ? String(customer.id) : "",
      amount: Number(payment.amount || 0),
      amountFormatted: formatCurrencyINR(payment.amount),
      paymentMode: payment.paymentMode || "Cash",
      status: "Completed",
      date: payment.date,
      dateFormatted: formatDateDisplay(payment.date),
    };
  });

  const interestRows = interestLogs.map((interest) => {
    const loan = loans.find((l) => String(l.id) === String(interest.loanId));
    const customer = loan ? customers.find((c) => String(c.id) === String(loan.customerId)) : null;

    return {
      loanId: loan ? String(loan.id) : "",
      loanNo: loan ? `#${String(loan.loanNo || loan.id).padStart(3, "0")}` : "Unknown",
      customer: customer ? customer.name : "Unknown",
      customerId: customer ? String(customer.id) : "",
      interest: Number(interest.amount || 0),
      interestFormatted: formatCurrencyINR(interest.amount),
      rateFormatted: loan ? `${loan.rate || 0}%` : "N/A",
      date: interest.date,
      dateFormatted: formatDateDisplay(interest.date),
    };
  });

  const filteredLoanRows = applyReportFilters(loanRows, { fromDate, toDate, customerFilter, loanFilter, statusFilter, searchText });
  const filteredPaymentRows = applyReportFilters(paymentRows, { fromDate, toDate, customerFilter, loanFilter, searchText });
  const filteredInterestRows = applyReportFilters(interestRows, { fromDate, toDate, customerFilter, loanFilter, searchText });

  if (reportKey === "customerStatement") {
    if (!customerFilter) return [];
    const ledgerRows = await getCustomerLedgerRows(customerFilter);
    const formatted = ledgerRows.map((row) => ({
      date: row.date,
      loanNo: `#${String(row.loanNo || 0).padStart(3, "0")}`,
      type: row.type,
      amount: row.type === "Payment" ? -Math.abs(Number(row.amount || 0)) : Number(row.amount || 0),
      amountFormatted: formatCurrencyINR(row.amount),
      balance: row.balance,
      balanceFormatted: formatCurrencyINR(row.balance),
    }));
    return formatted.filter((row) => {
      if (fromDate && row.date && new Date(row.date) < fromDate) return false;
      if (toDate && row.date && new Date(row.date) > toDate) return false;
      if (!searchText) return true;
      return Object.values(row).some((value) => String(value).toLowerCase().includes(searchText));
    });
  }

  switch (reportKey) {
    case "loanReport":
      return filteredLoanRows;
    case "disbursementReport":
      return filteredLoanRows;
    case "collectionReport":
      return filteredPaymentRows;
    case "outstandingReport":
      return filteredLoanRows.filter((row) => row.outstanding > 0);
    case "overdueReport":
      return filteredLoanRows.filter((row) => row.outstanding > 0 && row.daysSinceLastPayment > 30);
    case "profitReport":
      return filteredInterestRows;
    default:
      return [];
  }
}

function applyReportFilters(rows, filters) {
  return rows.filter((row) => {
    if (filters.fromDate && row.date) {
      if (new Date(row.date) < filters.fromDate) return false;
    }
    if (filters.toDate && row.date) {
      if (new Date(row.date) > filters.toDate) return false;
    }
    if (filters.customerFilter && row.customerId) {
      if (String(row.customerId) !== String(filters.customerFilter)) return false;
    }
    if (filters.loanFilter && row.loanId) {
      if (String(row.loanId) !== String(filters.loanFilter)) return false;
    }
    if (filters.statusFilter && row.status) {
      if (filters.statusFilter === "Active" && row.status !== "Active") return false;
      if (filters.statusFilter === "Closed" && row.status !== "Closed") return false;
      if (filters.statusFilter === "Locked" && row.status !== "Locked") return false;
    }
    if (filters.searchText && filters.searchText.length) {
      const text = filters.searchText;
      const match = Object.values(row).some((value) => String(value).toLowerCase().includes(text));
      if (!match) return false;
    }
    return true;
  });
}

function getLastPaymentDate(loanId) {
  const loanPayments = payments
    .filter((payment) => String(payment.loanId) === String(loanId) && payment.date)
    .map((payment) => payment.date)
    .sort((a, b) => new Date(b) - new Date(a));
  return loanPayments.length ? loanPayments[0] : null;
}

function getDaysSinceDate(dateValue) {
  if (!dateValue) return 0;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 0;
  const diff = Date.now() - date.getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function formatCurrencyINR(value) {
  const amount = Number(value) || 0;
  return amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
}

function formatDateDisplay(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

async function getCustomerLedgerRows(customerId) {
  try {
    const result = await api.get(`/ledger/${customerId}`);
    return result.rows || [];
  } catch (error) {
    console.error("Failed to load customer statement:", error);
    return [];
  }
}

function exportCurrentReport(format) {
  const report = reportDefinitions[currentReportKey];
  if (!report) return;

  const tableBody = document.getElementById("reportTableBody");
  const cells = Array.from(tableBody.querySelectorAll("tr")).map((row) =>
    Array.from(row.querySelectorAll("td")).map((cell) => cell.innerText.trim())
  );
  const headers = report.columns.map((col) => col.label);
  const filenameBase = `${report.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}`;

  if (format === "pdf") {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(14);
    doc.text(report.name, 40, 40);
    doc.autoTable({
      head: [headers],
      body: cells,
      startY: 60,
      margin: { left: 40, right: 40 },
      styles: { fontSize: 9, cellPadding: 4 },
    });
    doc.save(`${filenameBase}.pdf`);
  } else if (format === "xlsx") {
    const workbook = XLSX.utils.book_new();
    const exportData = cells.map((row) => {
      const obj = {};
      row.forEach((cell, index) => {
        obj[headers[index]] = cell;
      });
      return obj;
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(workbook, worksheet, report.name);
    XLSX.writeFile(workbook, `${filenameBase}.xlsx`);
  } else if (format === "csv") {
    const headerLine = headers.join(",");
    const csvBody = cells.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const csv = `${headerLine}\n${csvBody}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filenameBase}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function printCurrentReport() {
  window.print();
}
