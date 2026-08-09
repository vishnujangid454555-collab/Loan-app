// ================= ROLE-BASED ACCESS CONTROL (RBAC) SYSTEM =================

/**
 * RBAC Structure:
 * - SUPER_ADMIN: Full system access, manage companies
 * - ADMIN: Company owner, manage users and permissions
 * - USER: Regular user with assigned permissions
 */

// Current user's role and permissions (loaded from Firestore on login)
let userRole = null;
let userCompanyId = null;
let userPermissions = {}; // { module: { view, create, edit, delete, print, export } }
let currentCompany = null;

// Available modules and default permissions structure
const AVAILABLE_MODULES = [
  'dashboard',
  'master',
  'loans',
  'payments',
  'ledger',
  'passbook',
  'reports',
  'admin',
  'settings'
];

const PERMISSION_TYPES = ['view', 'create', 'edit', 'delete', 'print', 'export'];

/**
 * Role definitions
 */
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user'
};

/**
 * Initialize RBAC on login
 * Load user role, permissions, and company data from Firestore
 */
async function initializeRBAC(userId, email) {
  try {
    const db = window.firebase.initializeApp ? window.firebase.app().firestore() : null;
    if (!db) {
      console.error("Firestore not initialized");
      return;
    }

    // Check if user is Super Admin (hardcoded for security)
    if (email === "superadmin@loanapp.local") {
      userRole = ROLES.SUPER_ADMIN;
      userCompanyId = "super_admin_company";
      userPermissions = getFullPermissions();
      currentCompany = { id: "super_admin_company", name: "Super Admin Panel" };
      hideMenusByRole();
      return;
    }

    // Fetch user role and company from Firestore
    const usersRef = db.collection("users").doc(userId);
    const userDoc = await usersRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      userRole = userData.role || ROLES.USER;
      userCompanyId = userData.companyId;
      userPermissions = userData.permissions || getDefaultPermissions(userRole);
      
      // Fetch company data
      if (userCompanyId) {
        const companyRef = db.collection("companies").doc(userCompanyId);
        const companyDoc = await companyRef.get();
        currentCompany = companyDoc.data() || { id: userCompanyId, name: "Company" };
      }
    } else {
      // New user - create with USER role
      userRole = ROLES.USER;
      userPermissions = getDefaultPermissions(ROLES.USER);
      await usersRef.set({
        email: email,
        role: userRole,
        companyId: userCompanyId,
        permissions: userPermissions,
        createdAt: new Date()
      });
    }

    hideMenusByRole();
  } catch (error) {
    console.error("Error initializing RBAC:", error);
  }
}

/**
 * Initialize RBAC for Super Admin (local login without Firebase)
 */
async function initializeRBACForSuperAdmin() {
  try {
    userRole = ROLES.SUPER_ADMIN;
    userCompanyId = "super_admin_company";
    userPermissions = getFullPermissions();
    currentCompany = { id: "super_admin_company", name: "Super Admin Panel" };
    hideMenusByRole();
    console.log("Super Admin RBAC initialized:", { userRole, userCompanyId });
  } catch (error) {
    console.error("Error initializing Super Admin RBAC:", error);
  }
}

/**
 * Get full permissions for Super Admin
 */
function getFullPermissions() {
  const permissions = {};
  AVAILABLE_MODULES.forEach(module => {
    permissions[module] = {};
    PERMISSION_TYPES.forEach(type => {
      permissions[module][type] = true;
    });
  });
  return permissions;
}

/**
 * Get default permissions based on role
 */
function getDefaultPermissions(role) {
  const permissions = {};
  
  AVAILABLE_MODULES.forEach(module => {
    permissions[module] = {};
    
    if (role === ROLES.SUPER_ADMIN) {
      // Full access
      PERMISSION_TYPES.forEach(type => {
        permissions[module][type] = true;
      });
    } else if (role === ROLES.ADMIN) {
      // Admin can view all modules, create/edit/delete based on module
      if (module === 'admin' || module === 'settings') {
        // Admin can manage their own settings
        permissions[module] = { view: true, create: true, edit: true, delete: true, print: false, export: true };
      } else {
        // Admin can manage data in other modules
        permissions[module] = { view: true, create: true, edit: true, delete: true, print: true, export: true };
      }
    } else if (role === ROLES.USER) {
      // Users have limited default permissions (admin assigns specific ones)
      permissions[module] = { view: false, create: false, edit: false, delete: false, print: false, export: false };
    }
  });
  
  return permissions;
}

/**
 * Check if user has permission for a module and action
 */
function hasPermission(module, action = 'view') {
  if (userRole === ROLES.SUPER_ADMIN) {
    return true; // Super admin has all permissions
  }

  if (!userPermissions[module]) {
    return false;
  }

  return userPermissions[module][action] === true;
}

/**
 * Hide menu items based on user role
 */
function hideMenusByRole() {
  const buttons = document.querySelectorAll('.sidebar button');
  
  buttons.forEach(button => {
    const sectionName = button.textContent.toLowerCase();
    let moduleId = sectionName.replace(/\s+/g, '');
    
    // Map button text to module IDs
    const moduleMap = {
      'dashboard': 'dashboard',
      'master': 'master',
      'loans': 'loans',
      'payments': 'payment',
      'ledger': 'ledger',
      'passbook': 'passbook',
      'reports': 'reports',
      'superadmin': 'admin',
      'settings': 'settings'
    };
    
    const module = moduleMap[moduleId] || moduleId;
    
    // Hide button if user doesn't have view permission
    if (!hasPermission(module, 'view')) {
      button.style.display = 'none';
    } else {
      button.style.display = 'block';
    }
  });
}

/**
 * Filter data based on company (multi-tenant)
 */
function filterDataByCompany(data) {
  if (userRole === ROLES.SUPER_ADMIN) {
    return data; // Super admin sees all data
  }

  if (Array.isArray(data)) {
    return data.filter(item => item.companyId === userCompanyId);
  }

  return data;
}

/**
 * Add company ID to new data entries
 */
function addCompanyIdToData(data) {
  if (userRole !== ROLES.SUPER_ADMIN) {
    data.companyId = userCompanyId;
  }
  return data;
}

/**
 * Check if user can access a section (for route protection)
 */
function canAccessSection(sectionName) {
  const moduleMap = {
    'dashboard': 'dashboard',
    'master': 'master',
    'loan': 'loans',
    'payment': 'payment',
    'ledger': 'ledger',
    'passbook': 'passbook',
    'reports': 'reports',
    'admin': 'admin',
    'settings': 'settings'
  };

  const module = moduleMap[sectionName] || sectionName;
  return hasPermission(module, 'view');
}

/**
 * Check if user can perform action on a module
 */
function canPerformAction(module, action) {
  if (userRole === ROLES.SUPER_ADMIN) {
    return true;
  }

  if (!hasPermission(module, action)) {
    showAccessDeniedMessage(action, module);
    return false;
  }

  return true;
}

/**
 * Show access denied message
 */
function showAccessDeniedMessage(action, module) {
  const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);
  const capitalizedModule = module.charAt(0).toUpperCase() + module.slice(1);
  
  Swal.fire({
    icon: 'error',
    title: 'Access Denied',
    text: `You don't have permission to ${action} in ${capitalizedModule} module.`,
    confirmButtonColor: '#0ea5e9'
  });
}

/**
 * Get user info display
 */
function getUserInfo() {
  return {
    role: userRole,
    companyId: userCompanyId,
    company: currentCompany,
    permissions: userPermissions
  };
}

/**
 * Update user permissions (only Admin can do this)
 */
async function updateUserPermissions(targetUserId, newPermissions) {
  if (userRole !== ROLES.ADMIN && userRole !== ROLES.SUPER_ADMIN) {
    showAccessDeniedMessage('update', 'user_permissions');
    return false;
  }

  try {
    const db = window.firebase.app().firestore();
    await db.collection("users").doc(targetUserId).update({
      permissions: newPermissions,
      updatedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error("Error updating permissions:", error);
    return false;
  }
}

/**
 * Update user role (only Admin/Super Admin can do this)
 */
async function updateUserRole(targetUserId, newRole) {
  if (userRole !== ROLES.ADMIN && userRole !== ROLES.SUPER_ADMIN) {
    showAccessDeniedMessage('update', 'user_role');
    return false;
  }

  try {
    const db = window.firebase.app().firestore();
    const permissions = getDefaultPermissions(newRole);
    
    await db.collection("users").doc(targetUserId).update({
      role: newRole,
      permissions: permissions,
      updatedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error("Error updating role:", error);
    return false;
  }
}

/**
 * Hook to override existing functions with permission checks
 */
function applyRBACToExistingFunctions() {
  // Dashboard
  const originalInitApp = window.initApp;
  if (originalInitApp) {
    window.initApp = function() {
      if (!canAccessSection('dashboard')) {
        console.warn("User cannot access Dashboard");
        return;
      }
      originalInitApp.call(this);
    };
  }

  // Master
  const originalAddCustomer = window.addCustomer;
  if (originalAddCustomer) {
    window.addCustomer = function() {
      if (!canPerformAction('master', 'create')) return;
      // Add company ID to customer
      const customerData = document.getElementById("master_cname")?.value;
      originalAddCustomer.call(this);
    };
  }

  // Loans
  const originalAddLoan = window.addLoan;
  if (originalAddLoan) {
    window.addLoan = function() {
      if (!canPerformAction('loans', 'create')) return;
      originalAddLoan.call(this);
    };
  }

  console.log("RBAC applied to existing functions");
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    applyRBACToExistingFunctions();
  }, 2000);
});
