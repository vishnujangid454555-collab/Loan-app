// ================= MASTER MANAGEMENT =================

let editingCustomerId = null;
let editingVendorId = null;
let editingBankId = null;
let editingUPIId = null;
let editingAdditionalDetailId = null;

// ================= MASTER TAB SWITCH =================
function showMasterTab(tabName) {
  document.querySelectorAll(".master-tab-content").forEach(tab => tab.classList.add("hidden"));
  document.getElementById("master-" + tabName).classList.remove("hidden");

  document.querySelectorAll(".master-tab-btn").forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");
}

// ================= HELPER: GET CURRENT CUSTOMER INPUTS =================
function getCustomerInputIds() {
  // Check if Master section is visible
  let masterTab = document.getElementById("master-customers");
  if (masterTab && !masterTab.classList.contains("hidden")) {
    return {
      cname: "master_cname",
      cmobile: "master_cmobile",
      cref: "master_cref",
      cpan: "master_cpan",
      cagreement: "master_cagreement",
      caddress: "master_caddress",
      cremark: "master_cremark"
    };
  }
  // Otherwise use Customer section
  return {
    cname: "cname",
    cmobile: "cmobile",
    cref: "cref",
    cpan: "cpan",
    cagreement: "cagreement",
    caddress: "caddress",
    cremark: "cremark"
  };
}

// ================= CUSTOMER =================
function addCustomer() {
  let ids = getCustomerInputIds();
  let cnameEl = document.getElementById(ids.cname);
  let cmobileEl = document.getElementById(ids.cmobile);
  let crefEl = document.getElementById(ids.cref);
  let cpanEl = document.getElementById(ids.cpan);
  let cagreementEl = document.getElementById(ids.cagreement);
  let caddressEl = document.getElementById(ids.caddress);
  let cremarkEl = document.getElementById(ids.cremark);

  if (!cnameEl || !cnameEl.value) {
    alert("Enter name");
    return;
  }

  // Capture additional details
  let additionalData = {};
  additionalDetails.forEach(a => {
    if (a.applicableTo.includes("Customer")) {
      let fieldId = `customer-ad-${a.id}`;
      let fieldEl = document.getElementById(fieldId);
      if (fieldEl) {
        additionalData[a.id] = fieldEl.value || "";
      }
    }
  });

  if (editingCustomerId) {
    let idx = customers.findIndex(c => String(c.id) === String(editingCustomerId));
    if (idx !== -1) {
      customers[idx].name = cnameEl.value;
      customers[idx].mobile = cmobileEl ? cmobileEl.value : "";
      customers[idx].ref = crefEl ? crefEl.value : "";
      customers[idx].pan = cpanEl ? cpanEl.value : "";
      customers[idx].agreement = cagreementEl ? cagreementEl.value : "";
      customers[idx].address = caddressEl ? caddressEl.value : "";
      customers[idx].remark = cremarkEl ? cremarkEl.value : "";
      customers[idx].additionalDetails = additionalData;
    }
    editingCustomerId = null;
    let masterBtn = document.querySelector("#master-customers .primary-btn");
    let customerBtn = document.querySelector("#customer .primary-btn");
    if (masterBtn) masterBtn.innerText = "Add Customer";
    if (customerBtn) customerBtn.innerText = "Add Customer";
  } else {
    let exists = customers.some(c =>
      c.name.toLowerCase() === cnameEl.value.toLowerCase() &&
      c.mobile === (cmobileEl ? cmobileEl.value : "") &&
      !c.locked
    );

    if (exists) return alert("Customer already exists");

    customers.push({
      id: Date.now(),  // Stored as number
      name: cnameEl.value,
      mobile: cmobileEl ? cmobileEl.value : "",
      ref: crefEl ? crefEl.value : "",
      pan: cpanEl ? cpanEl.value : "",
      agreement: cagreementEl ? cagreementEl.value : "",
      address: caddressEl ? caddressEl.value : "",
      remark: cremarkEl ? cremarkEl.value : "",
      additionalDetails: additionalData,
      locked: false,
      createdAt: new Date().toISOString()
    });
  }

  if (cnameEl) cnameEl.value = "";
  if (cmobileEl) cmobileEl.value = "";
  if (crefEl) crefEl.value = "";
  if (cpanEl) cpanEl.value = "";
  if (cagreementEl) cagreementEl.value = "";
  if (caddressEl) caddressEl.value = "";
  if (cremarkEl) cremarkEl.value = "";

  save();
  loadCustomers();
}

function deleteCustomer(id) {
  let hasLoan = loans.some(l => String(l.customerId) === String(id));
  if (hasLoan) {
    alert("Cannot delete customer: This customer has associated loans (completed or incomplete).");
    return;
  }

  customers = customers.filter(c => String(c.id) !== String(id));
  save();
  loadCustomers();
  loadLoans();
}

function handleCustomerAction(selectElement, id) {
  let action = selectElement.value;
  selectElement.value = "";
  if (!action) return;

  if (action === 'view') {
    viewCustomer(id);
  } else if (action === 'edit') {
    let customer = customers.find(c => String(c.id) === String(id));
    if (!customer) return;
    editingCustomerId = id;
    let ids = getCustomerInputIds();
    document.getElementById(ids.cname).value = customer.name || "";
    document.getElementById(ids.cmobile).value = customer.mobile || "";
    document.getElementById(ids.cref).value = customer.ref || "";
    document.getElementById(ids.cpan).value = customer.pan || "";
    document.getElementById(ids.cagreement).value = customer.agreement || "";
    document.getElementById(ids.caddress).value = customer.address || "";
    document.getElementById(ids.cremark).value = customer.remark || "";

    let masterBtn = document.querySelector("#master-customers .primary-btn");
    let customerBtn = document.querySelector("#customer .primary-btn");
    if (masterBtn) masterBtn.innerText = "Save Changes";
    if (customerBtn) customerBtn.innerText = "Save Changes";
    window.scrollTo(0, 0);
  } else if (action === 'delete') {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomer(id);
    }
  } else if (action === 'lock' || action === 'unlock') {
    let customer = customers.find(c => String(c.id) === String(id));
    if (customer) {
      customer.locked = !customer.locked;
      save();
      loadCustomers();
      loadLoans();
    }
  }
}

function loadCustomers() {
  try {
    let allCustomers = customers;
    const query = document.getElementById("customerSearch")?.value.toLowerCase() || "";
    let filteredCustomers = allCustomers;
    if (query) {
      filteredCustomers = allCustomers.filter(c => 
        (c.name || "").toLowerCase().includes(query) || 
        (c.mobile || "").toLowerCase().includes(query)
      );
    }

    let tableHTML = filteredCustomers.map(c => {
      let optionsHTML = c.locked 
        ? '<option value="">Locked...</option><option value="unlock">Unlock</option>'
        : '<option value="">Action...</option><option value="view">View</option><option value="edit">Edit</option><option value="delete">Delete</option><option value="lock">Lock</option>';
      
      return `
      <tr style="${c.locked ? 'opacity: 0.6; background-color: #f0f0f0;' : ''}">
        <td>${c.name || ""}</td>
        <td>${c.mobile || ""}</td>
        <td>${c.pan || ""}</td>
        <td>${c.address || ""}</td>
        <td>
          <select onchange="handleCustomerAction(this, ${c.id})">
            ${optionsHTML}
          </select>
        </td>
      </tr>
    `;
    }).join("");

    let masterList = document.getElementById("masterCustomerList");
    let customerList = document.getElementById("customerList");

    if (masterList) masterList.innerHTML = tableHTML;
    if (customerList) customerList.innerHTML = tableHTML;

    loanCustomer.innerHTML = '<option value="">-- Select Customer --</option><option value="__add_new__">+ Add New Customer</option>' + allCustomers.map(c => `<option value="${Number(c.id)}">${c.name}</option>`).join("");
    if (typeof ledgerCustomer !== 'undefined') {
      ledgerCustomer.innerHTML = '<option value="">-- Select Customer --</option>' + allCustomers.map(c => `<option value="${Number(c.id)}">${c.name}</option>`).join("");
    }
    
    if (loanCustomer && !loanCustomer.dataset.listenerAdded) {
      loanCustomer.addEventListener('change', function() {
        if (this.value === '__add_new__') {
          showSection('master');
          showMasterTab('customers');
          this.value = '';
        }
      });
      loanCustomer.dataset.listenerAdded = 'true';
    }
  } catch (error) {
    console.log("Error loading customers:", error);
  }
}

// ================= VENDORS =================
function addVendor() {
  if (!document.getElementById("vname").value) return alert("Enter transactor name");

  let additionalData = {};
  additionalDetails.forEach(a => {
    if (a.applicableTo.includes("Vendor")) {
      let fieldId = `vendor-ad-${a.id}`;
      let fieldEl = document.getElementById(fieldId);
      if (fieldEl) {
        additionalData[a.id] = fieldEl.value || "";
      }
    }
  });

  if (editingVendorId) {
    let idx = vendors.findIndex(v => v.id === editingVendorId);
    if (idx !== -1) {
      vendors[idx].name = document.getElementById("vname").value;
      vendors[idx].mobile = document.getElementById("vmobile").value;
      vendors[idx].email = document.getElementById("vemail").value;
      vendors[idx].company = document.getElementById("vcompany").value;
      vendors[idx].gst = document.getElementById("vgst").value;
      vendors[idx].address = document.getElementById("vaddress").value;
      vendors[idx].additionalDetails = additionalData;
    }
    editingVendorId = null;
    let masterBtn = document.querySelector("#master-vendors .primary-btn");
    if (masterBtn) masterBtn.innerText = "Add Transactor";
  } else {
    vendors.push({
      id: Date.now(),
      name: document.getElementById("vname").value,
      mobile: document.getElementById("vmobile").value,
      email: document.getElementById("vemail").value,
      company: document.getElementById("vcompany").value,
      gst: document.getElementById("vgst").value,
      address: document.getElementById("vaddress").value,
      additionalDetails: additionalData,
      locked: false
    });
  }

  document.getElementById("vname").value = "";
  document.getElementById("vmobile").value = "";
  document.getElementById("vemail").value = "";
  document.getElementById("vcompany").value = "";
  document.getElementById("vgst").value = "";
  document.getElementById("vaddress").value = "";

  save();
  loadVendors();
}

function loadVendors() {
  let vendorList = document.getElementById("vendorList");
  if (!vendorList) return;

  const query = document.getElementById("vendorSearch")?.value.toLowerCase() || "";
  let filteredVendors = vendors;
  if (query) {
    filteredVendors = vendors.filter(v => 
      (v.name || "").toLowerCase().includes(query) || 
      (v.mobile || "").toLowerCase().includes(query)
    );
  }

  vendorList.innerHTML = filteredVendors.map(v => `
    <tr>
      <td>${v.name || ""}</td>
      <td>${v.mobile || ""}</td>
      <td>${v.company || ""}</td>
      <td>${v.gst || ""}</td>
      <td>
        <select onchange="handleVendorAction(this, ${v.id})">
          ${v.locked ? '<option value="">Locked...</option><option value="unlock">Unlock</option>' : '<option value="">Action...</option><option value="view">View</option><option value="edit">Edit</option><option value="delete">Delete</option><option value="lock">Lock</option>'}
        </select>
      </td>
    </tr>
  `).join("");
}

function handleVendorAction(selectElement, id) {
  let action = selectElement.value;
  selectElement.value = "";
  if (!action) return;

  if (action === 'view') {
    viewVendor(id);
  } else if (action === 'edit') {
    let vendor = vendors.find(v => v.id === id);
    if (!vendor) return;
    editingVendorId = id;
    document.getElementById("vname").value = vendor.name || "";
    document.getElementById("vmobile").value = vendor.mobile || "";
    document.getElementById("vemail").value = vendor.email || "";
    document.getElementById("vcompany").value = vendor.company || "";
    document.getElementById("vgst").value = vendor.gst || "";
    document.getElementById("vaddress").value = vendor.address || "";

    document.querySelector("#master-vendors .primary-btn").innerText = "Save Changes";
    window.scrollTo(0, 0);
  } else if (action === 'delete') {
    if (confirm("Are you sure you want to delete this transactor?")) {
      vendors = vendors.filter(v => v.id !== id);
      save();
      loadVendors();
    }
  } else if (action === 'lock' || action === 'unlock') {
    let vendor = vendors.find(v => v.id === id);
    if (vendor) {
      vendor.locked = !vendor.locked;
      save();
      loadVendors();
    }
  }
}

// ================= BANKS =================
function addBank() {
  if (!document.getElementById("bname").value) return alert("Enter bank name");

  if (editingBankId) {
    let idx = banks.findIndex(b => b.id === editingBankId);
    if (idx !== -1) {
      banks[idx].name = document.getElementById("bname").value;
      banks[idx].account = document.getElementById("baccount").value;
      banks[idx].ifsc = document.getElementById("bifsc").value;
      banks[idx].holder = document.getElementById("bholder").value;
      banks[idx].branch = document.getElementById("bbranch").value;
      banks[idx].remark = document.getElementById("bremark").value;
    }
    editingBankId = null;
    let masterBtn = document.querySelector("#master-banks .primary-btn");
    if (masterBtn) masterBtn.innerText = "Add Bank";
  } else {
    banks.push({
      id: Date.now(),
      name: document.getElementById("bname").value,
      account: document.getElementById("baccount").value,
      ifsc: document.getElementById("bifsc").value,
      holder: document.getElementById("bholder").value,
      branch: document.getElementById("bbranch").value,
      remark: document.getElementById("bremark").value,
      locked: false
    });
  }

  document.getElementById("bname").value = "";
  document.getElementById("baccount").value = "";
  document.getElementById("bifsc").value = "";
  document.getElementById("bholder").value = "";
  document.getElementById("bbranch").value = "";
  document.getElementById("bremark").value = "";

  save();
  loadBanks();
  populateBankDropdown("loanBank");
  populateBankDropdown("paymentBank");
}

function loadBanks() {
  let bankList = document.getElementById("bankList");
  if (!bankList) return;

  bankList.innerHTML = banks.map(b => `
    <tr>
      <td>${b.name || ""}</td>
      <td>${b.account || ""}</td>
      <td>${b.holder || ""}</td>
      <td>${b.ifsc || ""}</td>
      <td>
        <select onchange="handleBankAction(this, ${b.id})">
          ${b.locked ? '<option value="">Locked...</option><option value="unlock">Unlock</option>' : '<option value="">Action...</option><option value="view">View</option><option value="edit">Edit</option><option value="delete">Delete</option><option value="lock">Lock</option>'}
        </select>
      </td>
    </tr>
  `).join("");
}

function handleBankAction(selectElement, id) {
  let action = selectElement.value;
  selectElement.value = "";
  if (!action) return;

  if (action === 'view') {
    viewBank(id);
  } else if (action === 'edit') {
    let bank = banks.find(b => b.id === id);
    if (!bank) return;
    editingBankId = id;
    document.getElementById("bname").value = bank.name || "";
    document.getElementById("baccount").value = bank.account || "";
    document.getElementById("bifsc").value = bank.ifsc || "";
    document.getElementById("bholder").value = bank.holder || "";
    document.getElementById("bbranch").value = bank.branch || "";
    document.getElementById("bremark").value = bank.remark || "";

    document.querySelector("#master-banks .primary-btn").innerText = "Save Changes";
    window.scrollTo(0, 0);
  } else if (action === 'delete') {
    if (confirm("Are you sure you want to delete this bank?")) {
      banks = banks.filter(b => b.id !== id);
      save();
      loadBanks();
    }
  } else if (action === 'lock' || action === 'unlock') {
    let bank = banks.find(b => b.id === id);
    if (bank) {
      bank.locked = !bank.locked;
      save();
      loadBanks();
    }
  }
}

// ================= UPI IDs =================
function addUPI() {
  if (!document.getElementById("upiid").value) return alert("Enter UPI ID");

  if (editingUPIId) {
    let idx = upiIds.findIndex(u => u.id === editingUPIId);
    if (idx !== -1) {
      upiIds[idx].upiId = document.getElementById("upiid").value;
      upiIds[idx].name = document.getElementById("upiname").value;
      upiIds[idx].mobile = document.getElementById("upimobile").value;
      upiIds[idx].provider = document.getElementById("upiprovider").value;
      upiIds[idx].remarks = document.getElementById("upiremarks").value;
    }
    editingUPIId = null;
    let masterBtn = document.querySelector("#master-upi .primary-btn");
    if (masterBtn) masterBtn.innerText = "Add UPI";
  } else {
    upiIds.push({
      id: Date.now(),
      upiId: document.getElementById("upiid").value,
      name: document.getElementById("upiname").value,
      mobile: document.getElementById("upimobile").value,
      provider: document.getElementById("upiprovider").value,
      remarks: document.getElementById("upiremarks").value,
      locked: false
    });
  }

  document.getElementById("upiid").value = "";
  document.getElementById("upiname").value = "";
  document.getElementById("upimobile").value = "";
  document.getElementById("upiprovider").value = "";
  document.getElementById("upiremarks").value = "";

  save();
  loadUPIs();
  populateUPIDropdown("loanUPI");
  populateUPIDropdown("paymentUPI");
}

function loadUPIs() {
  let upiList = document.getElementById("upiList");
  if (!upiList) return;

  upiList.innerHTML = upiIds.map(u => `
    <tr>
      <td>${u.upiId || ""}</td>
      <td>${u.name || ""}</td>
      <td>${u.mobile || ""}</td>
      <td>${u.provider || ""}</td>
      <td>
        <select onchange="handleUPIAction(this, ${u.id})">
          ${u.locked ? '<option value="">Locked...</option><option value="unlock">Unlock</option>' : '<option value="">Action...</option><option value="view">View</option><option value="edit">Edit</option><option value="delete">Delete</option><option value="lock">Lock</option>'}
        </select>
      </td>
    </tr>
  `).join("");
}

function handleUPIAction(selectElement, id) {
  let action = selectElement.value;
  selectElement.value = "";
  if (!action) return;

  if (action === 'view') {
    viewUPI(id);
  } else if (action === 'edit') {
    let upi = upiIds.find(u => u.id === id);
    if (!upi) return;
    editingUPIId = id;
    document.getElementById("upiid").value = upi.upiId || "";
    document.getElementById("upiname").value = upi.name || "";
    document.getElementById("upimobile").value = upi.mobile || "";
    document.getElementById("upiprovider").value = upi.provider || "";
    document.getElementById("upiremarks").value = upi.remarks || "";

    document.querySelector("#master-upi .primary-btn").innerText = "Save Changes";
    window.scrollTo(0, 0);
  } else if (action === 'delete') {
    if (confirm("Are you sure you want to delete this UPI?")) {
      upiIds = upiIds.filter(u => u.id !== id);
      save();
      loadUPIs();
    }
  } else if (action === 'lock' || action === 'unlock') {
    let upi = upiIds.find(u => u.id === id);
    if (upi) {
      upi.locked = !upi.locked;
      save();
      loadUPIs();
    }
  }
}

// ================= ADDITIONAL DETAILS =================
function addAdditionalDetail() {
  if (!document.getElementById("adTitle").value) return alert("Enter Title");

  let applicableTo = Array.from(document.querySelectorAll('input[name="applicableTo"]:checked'))
    .map(cb => cb.value);

  if (applicableTo.length === 0) return alert("Select at least one applicable section");

  additionalDetails.push({
    id: Date.now(),
    title: document.getElementById("adTitle").value,
    description: document.getElementById("adDescription").value,
    dataType: document.getElementById("adDataType").value,
    applicableTo: applicableTo
  });

  document.getElementById("adTitle").value = "";
  document.getElementById("adDescription").value = "";
  document.getElementById("adDataType").value = "text";
  document.querySelectorAll('input[name="applicableTo"]').forEach(cb => cb.checked = false);

  save();
  loadAdditionalDetails();

  renderLoanAdditionalFields();
  renderCustomerAdditionalFields();
  renderPaymentAdditionalFields();
  renderVendorAdditionalFields();
}

function loadAdditionalDetails() {
  let detailList = document.getElementById("additionalDetailList");
  if (!detailList) return;

  detailList.innerHTML = additionalDetails.map(a => `
    <tr>
      <td>${a.title || ""}</td>
      <td>${a.description || ""}</td>
      <td>${a.dataType || "text"}</td>
      <td>${a.applicableTo.join(", ")}</td>
      <td>
        <select onchange="handleAdditionalDetailAction(this, ${a.id})">
          <option value="">Action...</option>
          <option value="view">View</option>
          <option value="delete">Delete</option>
        </select>
      </td>
    </tr>
  `).join("");
}

function handleAdditionalDetailAction(selectElement, id) {
  let action = selectElement.value;
  selectElement.value = "";
  if (!action) return;

  if (action === 'view') {
    viewAdditionalDetail(id);
  } else if (action === 'delete') {
    if (confirm("Are you sure you want to delete this detail?")) {
      additionalDetails = additionalDetails.filter(a => a.id !== id);
      save();
      loadAdditionalDetails();
    }
  }
}
