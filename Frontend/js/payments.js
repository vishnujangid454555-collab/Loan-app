// ================= PAYMENT MANAGEMENT =================

async function addPayment() {
  if (!payAmount.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Information',
      text: 'Please enter payment amount',
      confirmButtonColor: '#0ea5e9'
    });
    return;
  }
  if (!payLoan.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Information',
      text: 'Please select a loan',
      confirmButtonColor: '#0ea5e9'
    });
    return;
  }

  let paymentAmount = Number(payAmount.value);
  let loanId = Number(payLoan.value);
  let loan = loans.find(l => l.id === loanId);

  if (!loan) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Loan not found',
      confirmButtonColor: '#0ea5e9'
    });
    return;
  }

  // Validate payment via backend (loanService.js)
  let validation;
  try {
    validation = await api.post("/loans/validate-payment", {
      loanId,
      amount: paymentAmount,
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Validation Failed",
      text: error.message,
      confirmButtonColor: "#0ea5e9",
    });
    return;
  }

  if (!validation.valid) {
    Swal.fire({
      icon: "error",
      title: "Payment Exceeds Balance",
      html: `<p>${validation.error}</p>
             <p style="margin-top: 10px;"><strong>Remaining Balance:</strong> ₹${validation.remainingBalance}</p>
             <p><strong>You are trying to pay:</strong> ₹${paymentAmount}</p>
             <p style="color: #ef4444; margin-top: 10px;">Please enter an amount ≤ ₹${validation.remainingBalance}</p>`,
      confirmButtonColor: "#0ea5e9",
    });
    return;
  }

  let selectedDate = payDate.value || new Date().toISOString().split("T")[0];
  let paymentMode = document.getElementById("paymentMode").value;
  let selectedBank = paymentMode === "Bank" ? document.getElementById("paymentBank").value : null;
  let selectedUPI = paymentMode === "UPI" ? document.getElementById("paymentUPI").value : null;

  // Capture additional details
  let additionalData = {};
  additionalDetails.forEach(a => {
    if (a.applicableTo.includes("Payment")) {
      let fieldId = `payment-ad-${a.id}`;
      let fieldEl = document.getElementById(fieldId);
      if (fieldEl) {
        additionalData[a.id] = fieldEl.value || "";
      }
    }
  });

  let exists = payments.some(p =>
    p.loanId == payLoan.value &&
    p.amount == payAmount.value &&
    p.date === selectedDate
  );

  if (exists) return alert("Payment already added");

  payments.push({
    loanId: Number(payLoan.value),
    amount: Number(payAmount.value),
    date: selectedDate,
    paymentMode: paymentMode,
    paymentBank: selectedBank,
    paymentUPI: selectedUPI,
    additionalDetails: additionalData
  });

  payAmount.value = "";
  payDate.value = "";
  document.getElementById("paymentMode").value = "Cash";
  document.getElementById("paymentBank").value = "";
  document.getElementById("paymentUPI").value = "";
  updatePaymentBankUPI();

  await save();
  loadPayments();
  updateDashboard();
}

// ================= LOAD PAYMENTS =================
function loadPayments() {
  let paymentList = document.getElementById("paymentList");
  if (!paymentList) return;

  const query = document.getElementById("paymentSearch")?.value.toLowerCase() || "";
  const filterDate = document.getElementById("paymentFilterDate")?.value || "";

  let filteredPayments = payments.filter(p => {
    let loan = loans.find(l => l.id === p.loanId);
    let customer = loan ? customers.find(c => Number(c.id) === Number(loan.customerId)) : null;
    let matchesQuery = !query ||
      (customer && customer.name.toLowerCase().includes(query)) ||
      (loan && String(loan.loanNo).includes(query));
    let matchesDate = !filterDate || p.date === filterDate;
    return matchesQuery && matchesDate;
  });

  paymentList.innerHTML = filteredPayments.map(p => {
    let originalIndex = payments.findIndex(origP => origP === p);
    let loan = loans.find(l => l.id === p.loanId);
    let customer = null;
    
    if (loan) {
      customer = customers.find(c => Number(c.id) === Number(loan.customerId));
    }

    return `
      <tr>
        <td>${loan ? '#' + String(loan.loanNo).padStart(3, '0') : 'Unknown'}</td>
        <td>${customer ? customer.name : "Unknown"}</td>
        <td>₹${p.amount}</td>
        <td>${p.date}</td>
        <td>${p.paymentMode}</td>
        <td>
          <select onchange="handlePaymentAction(this, ${originalIndex})">
            <option value="">Action...</option>
            <option value="view">View</option>
            <option value="delete">Delete</option>
          </select>
        </td>
      </tr>
    `;
  }).join("");
}

function handlePaymentAction(selectElement, index) {
  let action = selectElement.value;

  if (action === 'view') {
    let p = payments[index];
    let loan = loans.find(l => l.id === p.loanId);
    let customer = loan ? customers.find(c => Number(c.id) === Number(loan.customerId)) : null;

    let modeInfo = "";
    if (p.paymentMode === "Bank" && p.paymentBank) {
      let bank = banks.find(b => b.id == p.paymentBank);
      modeInfo = bank ? `<p><strong>Bank:</strong> ${bank.name} - ${bank.accountNo}</p>` : "";
    } else if (p.paymentMode === "UPI" && p.paymentUPI) {
      let upi = upiIds.find(u => u.id == p.paymentUPI);
      modeInfo = upi ? `<p><strong>UPI:</strong> ${upi.name} - ${upi.upiId}</p>` : "";
    }

    let html = `
      <p><strong>Loan ID:</strong> ${loan ? '#' + String(loan.loanNo).padStart(3, '0') : 'Unknown'}</p>
      <p><strong>Customer:</strong> ${customer ? customer.name : "Unknown"}</p>
      <p><strong>Amount:</strong> ₹${p.amount}</p>
      <p><strong>Date:</strong> ${p.date}</p>
      <p><strong>Mode:</strong> ${p.paymentMode}</p>
      ${modeInfo}
    `;

    openViewModal("Payment Details", html);
  } else if (action === 'delete') {
    if (confirm("Are you sure you want to delete this payment?")) {
      payments.splice(index, 1);
      save();
      loadPayments();
      updateDashboard();
    }
  }

  selectElement.value = "";
}

function filterPayments() {
  loadPayments();
}
