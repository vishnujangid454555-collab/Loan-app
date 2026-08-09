let adminUsers = [];

async function loadAdminPanel() {
  const notice = document.getElementById("adminAccessNotice");
  const content = document.getElementById("adminPanelContent");
  const userList = document.getElementById("adminUserList");

  if (!notice || !content || !userList) return;

  notice.textContent = "Checking admin access...";
  notice.style.display = "block";
  content.style.display = "none";

  try {
    const me = await api.get("/admin/me");
    if (!me.isSuperAdmin) {
      notice.textContent = "You do not have super admin access. Please sign in with a configured super-admin account.";
      notice.style.background = "#fef2f2";
      notice.style.color = "#b91c1c";
      notice.style.borderColor = "#fecaca";
      return;
    }

    document.getElementById("adminCurrentUser").textContent = me.email || "Unknown";
    document.getElementById("adminCurrentRole").textContent = me.role || "super_admin";

    const result = await api.get("/admin/users");
    adminUsers = result.users || [];
    renderAdminUsers();

    document.getElementById("adminUserCount").textContent = adminUsers.length;
    notice.style.display = "none";
    content.style.display = "block";
  } catch (error) {
    notice.textContent = error.message || "Unable to load admin panel.";
    notice.style.background = "#fef2f2";
    notice.style.color = "#b91c1c";
    notice.style.borderColor = "#fecaca";
  }
}

function renderAdminUsers() {
  const list = document.getElementById("adminUserList");
  const search = document.getElementById("adminSearch")?.value?.toLowerCase() || "";

  if (!list) return;

  const filteredUsers = adminUsers.filter((user) => {
    const text = `${user.email || ""} ${user.displayName || ""}`.toLowerCase();
    return text.includes(search);
  });

  if (!filteredUsers.length) {
    list.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 16px; color:#64748b;">No users found.</td></tr>';
    return;
  }

  list.innerHTML = filteredUsers.map((user) => {
    const counts = user.dataCounts || {};
    const summary = [
      `Customers: ${counts.customers || 0}`,
      `Loans: ${counts.loans || 0}`,
      `Payments: ${counts.payments || 0}`,
      `Vendors: ${counts.vendors || 0}`,
    ].join(" • ");

    return `
      <tr>
        <td>${user.email || "No email"}</td>
        <td>${user.displayName || "—"}</td>
        <td>${user.role || "user"}</td>
        <td>${user.disabled ? "Disabled" : "Active"}</td>
        <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td>
        <td style="white-space: normal;">${summary}</td>
      </tr>
    `;
  }).join("");
}
