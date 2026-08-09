// ================= PASSBOOK MANAGEMENT (Transaction Record by Person) =================

/**
 * Load all transactors from vendors array
 * Transactor = Person with whom you do transactions (vendors, suppliers, etc.)
 */
function loadPassbookTransactors() {
  let select = document.getElementById("passbookTransactor");
  if (!select) return;
  
  select.innerHTML = '<option value="">-- Select Transactor --</option>';
  
  if (vendors && vendors.length > 0) {
    vendors.forEach(v => {
      select.innerHTML += `<option value="${v.id}">${v.name}</option>`;
    });
  }
  
  if (!select.dataset.listenerAdded) {
    select.addEventListener('change', function() {
      loadPassbookEntries();
    });
    select.dataset.listenerAdded = 'true';
  }
}

/**
 * Add a new transaction entry for the selected transactor
 * Amount In = Money received from this person
 * Amount Out = Money given to this person
 */
function addPassbookEntry() {
  let transactorId = document.getElementById("passbookTransactor").value;
  let date = document.getElementById("passbookDate").value;
  let amountIn = parseFloat(document.getElementById("passbookAmountIn").value) || 0;
  let amountOut = parseFloat(document.getElementById("passbookAmountOut").value) || 0;
  let remarks = document.getElementById("passbookRemarks").value;

  // Validation
  if (!transactorId) {
    alert("Please select a transactor (person name)");
    return;
  }
  if (!date) {
    alert("Please select a date");
    return;
  }
  if (amountIn === 0 && amountOut === 0) {
    alert("Please enter amount in or amount out");
    return;
  }

  // Add entry to array
  passbookEntries.push({
    id: Date.now(),
    transactorId: parseInt(transactorId),
    date: date,
    amountIn: amountIn,
    amountOut: amountOut,
    remarks: remarks
  });

  // Save to localStorage
  save();

  // Clear form fields
  document.getElementById("passbookAmountIn").value = "";
  document.getElementById("passbookAmountOut").value = "";
  document.getElementById("passbookRemarks").value = "";

  // Reload display
  loadPassbookEntries();
  alert("Transaction entry added successfully!");
}

/**
 * Load and display all entries for selected transactor
 * Calculates running balance (Amount In - Amount Out)
 */
function loadPassbookEntries() {
  let transactorId = parseInt(document.getElementById("passbookTransactor").value);

  if (!transactorId) {
    document.getElementById("passbookTable").innerHTML = "";
    document.getElementById("passbookSummary").style.display = "none";
    document.getElementById("passbookSummaryTitle").style.display = "none";
    return;
  }

  // Filter entries for selected transactor
  let entries = passbookEntries.filter(e => e.transactorId === transactorId);
  
  // Sort by date (oldest first)
  entries.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate running totals
  let runningIn = 0;
  let runningOut = 0;
  
  entries.forEach(entry => {
    runningIn += entry.amountIn;
    runningOut += entry.amountOut;
    entry.computedBalance = runningIn - runningOut;
  });

  let totalIn = runningIn;
  let totalOut = runningOut;
  let balance = totalIn - totalOut;

  // Apply date filter if specified
  const filterDate = document.getElementById("passbookFilterDate")?.value || "";
  let displayedEntries = entries;
  if (filterDate) {
    displayedEntries = entries.filter(e => e.date === filterDate);
  }

  // Generate HTML for table rows
  let html = displayedEntries.map(entry => {
    const balanceClass = entry.computedBalance < 0 ? 'color: red;' : 'color: green;';
    return `<tr>
      <td>${entry.date}</td>
      <td style="text-align: right;">₹${entry.amountIn.toFixed(2)}</td>
      <td style="text-align: right;">₹${entry.amountOut.toFixed(2)}</td>
      <td style="text-align: right; ${balanceClass} font-weight: bold;">₹${entry.computedBalance.toFixed(2)}</td>
      <td>${entry.remarks || "-"}</td>
      <td><button onclick="deletePassbookEntry(${entry.id})" style="background: #dc3545; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Delete</button></td>
    </tr>`;
  }).join("");

  document.getElementById("passbookTable").innerHTML = html;

  // Display summary if entries exist
  if (entries.length > 0) {
    document.getElementById("totalIn").innerText = totalIn.toFixed(2);
    document.getElementById("totalOut").innerText = totalOut.toFixed(2);
    document.getElementById("balance").innerText = balance.toFixed(2);
    
    // Color code the balance
    const balanceSpan = document.getElementById("balance");
    if (balance > 0) {
      balanceSpan.style.color = "green";
    } else if (balance < 0) {
      balanceSpan.style.color = "red";
    } else {
      balanceSpan.style.color = "black";
    }
    
    document.getElementById("passbookSummary").style.display = "flex";
    document.getElementById("passbookSummaryTitle").style.display = "block";
  } else {
    document.getElementById("passbookSummary").style.display = "none";
    document.getElementById("passbookSummaryTitle").style.display = "none";
  }
}

/**
 * Delete a transaction entry
 */
function deletePassbookEntry(id) {
  if (confirm("Are you sure you want to delete this transaction entry?")) {
    passbookEntries = passbookEntries.filter(e => e.id !== id);
    save();
    loadPassbookEntries();
  }
}

/**
 * Filter passbook by date
 */
function filterPassbook() {
  loadPassbookEntries();
}

/**
 * Export passbook to Excel
 */
async function exportPassbookToExcel() {
  let transactorId = parseInt(document.getElementById("passbookTransactor").value);
  if (!transactorId) {
    alert("Please select a transactor first");
    return;
  }

  let transactor = vendors.find(v => v.id === transactorId);
  if (!transactor) {
    alert("Transactor not found");
    return;
  }

  let entries = passbookEntries.filter(e => e.transactorId === transactorId);
  entries.sort((a, b) => new Date(a.date) - new Date(b.date));

  let data = [
    ["PASSBOOK"],
    ["Transactor Name:", transactor.name],
    ["Transactor Mobile:", transactor.mobile || "N/A"],
    ["Generated:", new Date().toLocaleDateString()],
    []
  ];
  
  data.push(["Date", "Amount In (₹)", "Amount Out (₹)", "Balance (₹)", "Remarks"]);
  
  let runningIn = 0, runningOut = 0;
  entries.forEach(e => {
    runningIn += e.amountIn;
    runningOut += e.amountOut;
    data.push([
      e.date,
      e.amountIn.toFixed(2),
      e.amountOut.toFixed(2),
      (runningIn - runningOut).toFixed(2),
      e.remarks || ""
    ]);
  });

  data.push([]);
  data.push(["Summary:"]);
  data.push(["Total In:", runningIn.toFixed(2)]);
  data.push(["Total Out:", runningOut.toFixed(2)]);
  data.push(["Net Balance:", (runningIn - runningOut).toFixed(2)]);

  let wb = XLSX.utils.book_new();
  let ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Passbook");
  
  let fileName = `Passbook_${transactor.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Export passbook to PDF
 */
async function exportPassbookToPDF() {
  let transactorId = parseInt(document.getElementById("passbookTransactor").value);
  if (!transactorId) {
    alert("Please select a transactor first");
    return;
  }

  let transactor = vendors.find(v => v.id === transactorId);
  if (!transactor) {
    alert("Transactor not found");
    return;
  }

  let entries = passbookEntries.filter(e => e.transactorId === transactorId);
  entries.sort((a, b) => new Date(a.date) - new Date(b.date));

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Header
  doc.setFontSize(16);
  doc.text("PASSBOOK", 14, 15);
  
  doc.setFontSize(10);
  doc.text("Transactor: " + transactor.name, 14, 22);
  doc.text("Mobile: " + (transactor.mobile || "N/A"), 14, 28);
  doc.text("Generated: " + new Date().toLocaleDateString(), 14, 34);

  // Table data
  let tableData = [];
  let runningIn = 0, runningOut = 0;
  
  entries.forEach(e => {
    runningIn += e.amountIn;
    runningOut += e.amountOut;
    tableData.push([
      e.date,
      "₹" + e.amountIn.toFixed(2),
      "₹" + e.amountOut.toFixed(2),
      "₹" + (runningIn - runningOut).toFixed(2),
      e.remarks || "-"
    ]);
  });

  // Generate table
  doc.autoTable({
    head: [["Date", "Amount In", "Amount Out", "Balance", "Remarks"]],
    body: tableData,
    startY: 42,
    margin: { top: 42, right: 14, bottom: 14, left: 14 }
  });

  // Summary at bottom
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text("Summary:", 14, finalY);
  doc.text("Total I Received: ₹" + runningIn.toFixed(2), 14, finalY + 6);
  doc.text("Total I Gave: ₹" + runningOut.toFixed(2), 14, finalY + 12);
  doc.text("Net Balance: ₹" + (runningIn - runningOut).toFixed(2), 14, finalY + 18);

  let fileName = `Passbook_${transactor.name}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// ================= LEDGER (backend: ledgerService.js) =================
async function loadLedger() {
  let cid = ledgerCustomer.value;
  if (!cid) return;

  try {
    const result = await api.get(`/ledger/${cid}`);
    const rows = result.rows || [];

    ledgerTable.innerHTML = rows
      .map(
        (r) => `<tr>
      <td>${r.date}</td>
      <td>#${r.loanNo}</td>
      <td>${r.type}</td>
      <td>₹${r.amount}</td>
      <td>₹${r.balance}</td>
    </tr>`
      )
      .join("");
  } catch (error) {
    console.error("Failed to load ledger:", error);
    ledgerTable.innerHTML = "";
  }
}

// Passbook transactor change listener
if (document.getElementById("passbookTransactor")) {
  document.getElementById("passbookTransactor").addEventListener("change", function () {
    loadPassbookEntries();
  });
}
