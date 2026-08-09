// ================= SUPER ADMIN - COMPANY MANAGEMENT =================

let adminsList = [];
let editingAdminId = null;

/**
 * Load all registered companies and their admins
 */
async function loadCompanies() {
  if (userRole !== ROLES.SUPER_ADMIN) {
    alert("Only Super Admin can access this.");
    return;
  }

  try {
    const db = window.firebase.app().firestore();
    const companiesRef = db.collection("companies");
    const snapshot = await companiesRef.orderBy("createdAt", "desc").get();

    adminsList = [];
    snapshot.forEach(doc => {
      adminsList.push({ id: doc.id, ...doc.data() });
    });

    renderCompaniesTable();
  } catch (error) {
    console.error("Error loading companies:", error);
    alert("Failed to load companies");
  }
}

/**
 * Render companies table
 */
function renderCompaniesTable() {
  const tableBody = document.getElementById("companiesTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = adminsList.map(company => `
    <tr>
      <td>${company.name || "-"}</td>
      <td>${company.adminEmail || "-"}</td>
      <td>${company.subscription || "Free"}</td>
      <td>${company.status === "active" ? "✅ Active" : "❌ Inactive"}</td>
      <td>
        <select onchange="handleCompanyAction(this, '${company.id}')" style="padding: 5px; border: 1px solid #bae6fd; border-radius: 4px;">
          <option value="">Actions</option>
          <option value="view">View Details</option>
          ${company.status === "active" ? `<option value="deactivate">Deactivate</option>` : `<option value="activate">Activate</option>`}
          ${company.status !== "blocked" ? `<option value="block">Block</option>` : `<option value="unblock">Unblock</option>`}
          <option value="delete">Delete</option>
          <option value="managUsers">Manage Users</option>
        </select>
      </td>
    </tr>
  `).join("");
}

/**
 * Handle company actions
 */
async function handleCompanyAction(selectElement, companyId) {
  const action = selectElement.value;
  selectElement.value = "";

  if (action === "view") {
    viewCompanyDetails(companyId);
  } else if (action === "deactivate") {
    updateCompanyStatus(companyId, "inactive");
  } else if (action === "activate") {
    updateCompanyStatus(companyId, "active");
  } else if (action === "block") {
    updateCompanyStatus(companyId, "blocked");
  } else if (action === "unblock") {
    updateCompanyStatus(companyId, "active");
  } else if (action === "delete") {
    deleteCompany(companyId);
  } else if (action === "managUsers") {
    showCompanyUsers(companyId);
  }
}

/**
 * View company details
 */
function viewCompanyDetails(companyId) {
  const company = adminsList.find(c => c.id === companyId);
  if (!company) return;

  const details = `
    <strong>Company Name:</strong> ${company.name}<br>
    <strong>Admin Email:</strong> ${company.adminEmail}<br>
    <strong>Phone:</strong> ${company.phone || "N/A"}<br>
    <strong>Subscription:</strong> ${company.subscription}<br>
    <strong>Status:</strong> ${company.status}<br>
    <strong>Created:</strong> ${new Date(company.createdAt?.toDate()).toLocaleDateString()}<br>
    <strong>Max Users:</strong> ${company.maxUsers || "Unlimited"}<br>
    <strong>Modules:</strong> ${company.modules ? company.modules.join(", ") : "All"}<br>
  `;

  Swal.fire({
    title: "Company Details",
    html: details,
    confirmButtonColor: '#0ea5e9'
  });
}

/**
 * Update company status
 */
async function updateCompanyStatus(companyId, newStatus) {
  try {
    const db = window.firebase.app().firestore();
    await db.collection("companies").doc(companyId).update({
      status: newStatus,
      updatedAt: new Date()
    });

    // Reload companies
    await loadCompanies();
    alert(`Company status updated to ${newStatus}`);
  } catch (error) {
    console.error("Error updating company:", error);
    alert("Failed to update company");
  }
}

/**
 * Delete company
 */
async function deleteCompany(companyId) {
  if (!confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
    return;
  }

  try {
    const db = window.firebase.app().firestore();
    
    // Delete company
    await db.collection("companies").doc(companyId).delete();

    // Delete all users of this company
    const usersSnapshot = await db.collection("users").where("companyId", "==", companyId).get();
    const batch = db.batch();
    usersSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Reload companies
    await loadCompanies();
    alert("Company deleted successfully");
  } catch (error) {
    console.error("Error deleting company:", error);
    alert("Failed to delete company");
  }
}

/**
 * Show users of a specific company
 */
async function showCompanyUsers(companyId) {
  try {
    const db = window.firebase.app().firestore();
    const usersSnapshot = await db.collection("users").where("companyId", "==", companyId).get();

    let usersHtml = '<table style="width:100%; border-collapse:collapse;"><tr><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr>';
    
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      usersHtml += `
        <tr style="border-bottom:1px solid #ddd;">
          <td style="padding:8px;">${user.email}</td>
          <td style="padding:8px;">${user.role}</td>
          <td style="padding:8px;">${user.status || "active"}</td>
          <td style="padding:8px;">
            <button onclick="deactivateUser('${doc.id}')" style="background:#ef4444; color:white; padding:5px 10px; border:none; border-radius:4px; cursor:pointer;">Deactivate</button>
          </td>
        </tr>
      `;
    });
    usersHtml += '</table>';

    Swal.fire({
      title: "Company Users",
      html: usersHtml,
      width: 700,
      confirmButtonColor: '#0ea5e9'
    });
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

/**
 * Register new company (Super Admin)
 */
async function registerNewCompany() {
  const companyName = prompt("Enter Company Name:");
  if (!companyName) return;

  const adminEmail = prompt("Enter Admin Email:");
  if (!adminEmail) return;

  const adminPhone = prompt("Enter Admin Phone (optional):");

  try {
    const db = window.firebase.app().firestore();
    const companyId = db.collection("companies").doc().id;

    // Create company document
    await db.collection("companies").doc(companyId).set({
      name: companyName,
      adminEmail: adminEmail,
      phone: adminPhone || "",
      subscription: "free",
      status: "active",
      modules: AVAILABLE_MODULES,
      maxUsers: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create admin user for this company
    const adminUserId = db.collection("users").doc().id;
    const adminPermissions = getDefaultPermissions(ROLES.ADMIN);
    
    await db.collection("users").doc(adminUserId).set({
      email: adminEmail,
      role: ROLES.ADMIN,
      companyId: companyId,
      permissions: adminPermissions,
      status: "active",
      createdAt: new Date()
    });

    alert(`Company and Admin created successfully!`);
    await loadCompanies();
  } catch (error) {
    console.error("Error registering company:", error);
    alert("Failed to register company");
  }
}

/**
 * Deactivate user
 */
async function deactivateUser(userId) {
  if (!confirm("Deactivate this user?")) return;

  try {
    const db = window.firebase.app().firestore();
    await db.collection("users").doc(userId).update({
      status: "inactive",
      updatedAt: new Date()
    });
    alert("User deactivated");
  } catch (error) {
    console.error("Error deactivating user:", error);
  }
}
