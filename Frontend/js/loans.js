// ================= LOAN MANAGEMENT =================

let editingLoanId = null;

function addLoan() {
  let amt = Number(amount.value);
  let rt = Number(rate.value);
  let custId = Number(loanCustomer.value);  // Convert to number

  // ✅ selected date use karo
  let selectedDate = loanDate.value || new Date().toISOString().split("T")[0];
  let loanMode = document.getElementById("loanMode").value;
  let selectedBank = loanMode === "Bank" ? document.getElementById("loanBank").value : null;
  let selectedUPI = loanMode === "UPI" ? document.getElementById("loanUPI").value : null;

  // Capture additional details
  let additionalData = {};
  additionalDetails.forEach(a => {
    if (a.applicableTo.includes("Loan")) {
      let fieldId = `loan-ad-${a.id}`;
      let fieldEl = document.getElementById(fieldId);
      if (fieldEl) {
        additionalData[a.id] = fieldEl.value || "";
      }
    }
  });

  if (!amt || !rt) return alert("Fill all fields");

  if (editingLoanId) {
    let idx = loans.findIndex(l => l.id === editingLoanId);
    if (idx !== -1) {
      loans[idx].customerId = custId;
      loans[idx].amount = amt;
      loans[idx].rate = rt;
      loans[idx].period = period.value;
      loans[idx].loanMode = loanMode;
      loans[idx].loanBank = selectedBank;
      loans[idx].loanUPI = selectedUPI;
      loans[idx].startDate = selectedDate;
      loans[idx].additionalDetails = additionalData;
    }
    editingLoanId = null;
    // Update button in both sections
    let masterLoanBtn = document.querySelector("#master .primary-btn");
    let loanBtn = document.querySelector("#loan .primary-btn");
    if (masterLoanBtn && masterLoanBtn.innerText === "Save Changes") masterLoanBtn.innerText = "Add Loan";
    if (loanBtn) loanBtn.innerText = "Add Loan";
  } else {
    let exists = loans.some(l =>
      l.customerId == custId &&
      l.amount == amt &&
      l.startDate === selectedDate &&
      !l.locked
    );

    if (exists) return alert("Loan already exists");

    let loan = {
      id: Date.now(),
      customerId: custId,
      amount: amt,
      rate: rt,
      period: period.value,
      loanMode: loanMode,
      loanBank: selectedBank,
      loanUPI: selectedUPI,
      additionalDetails: additionalData,
      loanNo: loans.length > 0 ? Math.max(...loans.map(l => l.loanNo || 0)) + 1 : 1,
      startDate: selectedDate,
      lastInterestDate: selectedDate,
      locked: false
    };

    loans.push(loan);
  }

  amount.value = "";
  rate.value = "";
  loanDate.value = "";
  document.getElementById("loanMode").value = "Cash";
  document.getElementById("loanBank").value = "";
  document.getElementById("loanUPI").value = "";
  updateLoanBankUPI();

  save();
  loadLoans();
  updateDashboard();
}

function handleLoanAction(selectElement, id) {
  let action = selectElement.value;
  selectElement.value = "";
  if (!action) return;

  if (action === 'view') {
    viewLoan(id);
  } else if (action === 'edit') {
    let loan = loans.find(l => l.id === id);
    if (!loan) return;
    editingLoanId = id;
    loanCustomer.value = loan.customerId;
    amount.value = loan.amount;
    rate.value = loan.rate;
    period.value = loan.period || "monthly";
    loanDate.value = loan.startDate;
    let md = document.getElementById("loanMode");
    if (md && loan.loanMode) md.value = loan.loanMode;

    document.querySelector("#loan .primary-btn").innerText = "Save Changes";
    // Also update button in Master section if visible
    let masterLoanBtn = document.querySelector("#master .primary-btn");
    if (masterLoanBtn) masterLoanBtn.innerText = "Save Changes";
    window.scrollTo(0, 0);
  } else if (action === 'delete') {
    if (confirm("Are you sure you want to delete this loan?")) {
      loans = loans.filter(l => l.id !== id);
      save();
      loadLoans();
      updateDashboard();
    }
  } else if (action === 'lock' || action === 'unlock') {
    let loan = loans.find(l => l.id === id);
    if (loan) {
      loan.locked = !loan.locked;
      save();
      loadLoans();
      updateDashboard();
    }
  }
}

function loadLoans() {
  const query = document.getElementById("loanSearch")?.value.toLowerCase() || "";
  const filterDate = document.getElementById("loanFilterDate")?.value || "";

  let filteredLoans = loans.filter(l => {
    let customer = customers.find(c => Number(c.id) === Number(l.customerId));
    let matchesQuery = !query || 
      (customer && customer.name.toLowerCase().includes(query)) ||
      String(l.loanNo).includes(query);
    let matchesDate = !filterDate || l.startDate === filterDate;
    return matchesQuery && matchesDate;
  });

  if (!loanList) return;

  loanList.innerHTML = filteredLoans.map(l => {
    let customer = customers.find(c => Number(c.id) === Number(l.customerId));
    let optionsHTML = l.locked 
      ? '<option value="">Locked...</option><option value="unlock">Unlock</option>'
      : '<option value="">Action...</option><option value="view">View</option><option value="edit">Edit</option><option value="delete">Delete</option><option value="lock">Lock</option>';

    return `
      <tr style="${l.locked ? 'opacity: 0.6; background-color: #f0f0f0;' : ''}">
        <td>#${String(l.loanNo).padStart(3, '0')}</td>
        <td>${customer ? customer.name : "Unknown"}</td>
        <td>${customer ? customer.mobile : ""}</td>
        <td>₹${l.amount}</td>
        <td>${l.rate}%</td>
        <td>${l.startDate}</td>
        <td>${l.period}</td>
        <td>
          <select onchange="handleLoanAction(this, ${l.id})">
            ${optionsHTML}
          </select>
        </td>
      </tr>
    `;
  }).join("");

  payLoan.innerHTML = '<option value="">-- Select Loan --</option>' + loans.filter(l => !l.locked).map(l => {
    let customer = customers.find(c => Number(c.id) === Number(l.customerId));
    let remainingBalance = calculateLoanBalance(l.id);

    return `<option value="${l.id}">
      ${customer ? customer.name : "Unknown"} - Remaining: ₹${Math.round(remainingBalance)}
    </option>`;
  }).join("");
}

function filterLoans() {
  loadLoans();
}
