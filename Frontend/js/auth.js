// ================= AUTHENTICATION FUNCTIONS =================

function toggleAuthForm(e) {
  e.preventDefault();
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  
  if (loginForm.style.display === "none") {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  } else {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
  }
}

// ================= UNIFIED LOGIN (User + Super Admin) =================

async function handleUnifiedLogin(event) {
  if (event) event.preventDefault();

  const emailOrUsername = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  if (!emailOrUsername || !password) {
    showAuthError("Please fill in all fields");
    return;
  }

  // Check if it's Super Admin login
  if (emailOrUsername === "admin" && password === SUPER_ADMIN_PASSWORD) {
    // Login as Super Admin
    currentUser = {
      email: "superadmin@loanapp.local",
      displayName: "Super Admin",
      isSuperAdmin: true,
      uid: "super-admin-uid"
    };

    localStorage.setItem("isSuperAdmin", "true");
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
    hideAuthError();

    const authOverlay = document.getElementById("authOverlay");
    const mainApp = document.getElementById("mainApp");
    if (authOverlay) authOverlay.style.display = "none";
    if (mainApp) mainApp.style.display = "flex";

    const currentUserDisplay = document.getElementById("currentUserDisplay");
    if (currentUserDisplay) {
      currentUserDisplay.textContent = "Super Admin";
    }

    const superAdminBtn = document.getElementById("superAdminBtn");
    if (superAdminBtn) superAdminBtn.style.display = "block";

    // Initialize RBAC for Super Admin
    if (typeof initializeRBACForSuperAdmin === 'function') {
      await initializeRBACForSuperAdmin();
    }

    await loadUserDataFromFirestore();
    return;
  }

  // Otherwise try Firebase login with email
  try {
    const firebaseAuthInstance = window.firebaseAuth || auth;
    if (!firebaseAuthInstance || !window.firebase?.signInWithEmailAndPassword) {
      showAuthError("Firebase not initialized. Please refresh the page.");
      return;
    }

    await window.firebase.signInWithEmailAndPassword(firebaseAuthInstance, emailOrUsername, password);
  } catch (error) {
    showAuthError(error.message || "Login failed. Please try again.");
  }
}

async function handleLogin(event) {
  if (event) event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showAuthError("Please fill in all fields");
    return;
  }

  try {
    const firebaseAuthInstance = window.firebaseAuth || auth;
    if (!firebaseAuthInstance || !window.firebase?.signInWithEmailAndPassword) {
      showAuthError("Firebase not initialized. Please refresh the page.");
      return;
    }

    await window.firebase.signInWithEmailAndPassword(firebaseAuthInstance, email, password);
  } catch (error) {
    showAuthError(error.message || "Login failed. Please try again.");
  }
}

async function handleSignup(event) {
  if (event) event.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim().toLowerCase();
  const password = document.getElementById("signupPassword").value;

  if (!name || !email || !password) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Information',
      text: 'Please fill in all fields',
      confirmButtonColor: '#0ea5e9'
    });
    return;
  }

  if (password.length < 6) {
    Swal.fire({
      icon: 'warning',
      title: 'Weak Password',
      text: 'Password must be at least 6 characters',
      confirmButtonColor: '#0ea5e9'
    });
    return;
  }

  try {
    const firebaseAuthInstance = window.firebaseAuth || auth;
    if (!firebaseAuthInstance || !window.firebase?.createUserWithEmailAndPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Firebase not initialized. Please refresh the page.',
        confirmButtonColor: '#0ea5e9'
      });
      return;
    }

    const userCredential = await window.firebase.createUserWithEmailAndPassword(firebaseAuthInstance, email, password);

    if (userCredential?.user && name && window.firebase?.updateProfile) {
      await window.firebase.updateProfile(userCredential.user, { displayName: name });
    }

    document.getElementById("signupName").value = "";
    document.getElementById("signupEmail").value = "";
    document.getElementById("signupPassword").value = "";

    Swal.fire({
      icon: 'success',
      title: 'Account Created!',
      text: 'Welcome to Loan App. Your account has been created successfully.',
      confirmButtonColor: '#0ea5e9'
    });
  } catch (error) {
    let errorMessage = 'An error occurred during signup';

    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered. Please use a different email or try logging in.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use a stronger password';
    } else if (error.message) {
      errorMessage = error.message;
    }

    Swal.fire({
      icon: 'error',
      title: 'Signup Failed',
      text: errorMessage,
      confirmButtonColor: '#0ea5e9'
    });
  }
}

// ================= CHECK IF EMAIL EXISTS =================
async function checkIfEmailExists(email) {
  try {
    if (!auth) {
      return false;
    }
    // Use the proper Firebase method to check if email is registered
    const signInMethods = await window.firebase.fetchSignInMethodsForEmail(auth, email);
    return signInMethods && signInMethods.length > 0; // Returns true if email exists
  } catch (error) {
    console.error("Error checking email:", error);
    // If there's an error, we'll let the signup attempt happen and catch any errors there
    return false;
  }
}

async function handleLogout() {
  try {
    if (!auth) {
      showAuthError("Firebase not initialized. Please refresh the page.");
      return;
    }
    await window.firebase.signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// ================= AUTH STATE LISTENER =================
function setupAuthListener() {
  if (!auth) {
    console.error("Auth not initialized");
    return;
  }

  window.firebase.onAuthStateChanged(auth, async (user) => {
    const authOverlay = document.getElementById("authOverlay");
    const mainApp = document.getElementById("mainApp");
    const currentUserDisplay = document.getElementById("currentUserDisplay");
    const superAdminBtn = document.getElementById("superAdminBtn");

    if (user) {
      // User is logged in (regular Firebase user, not super admin)
      currentUser = user;
      if (currentUserDisplay) {
        currentUserDisplay.textContent = user.email.split("@")[0];
      }
      if (authOverlay) authOverlay.style.display = "none";
      if (mainApp) mainApp.style.display = "flex";

      // Initialize RBAC system
      if (typeof initializeRBAC === 'function') {
        await initializeRBAC(user.uid, user.email);
      }

      // Hide super admin button for regular users
      localStorage.removeItem("isSuperAdmin");
      if (superAdminBtn) superAdminBtn.style.display = "none";

      // Load user data from Firestore
      await loadUserDataFromFirestore();
      
      // Set up data sync flag after initial load
      setTimeout(() => {
        setupFirestoreListener();
      }, 1000);
    } else {
      // User is logged out
      currentUser = null;
      if (authOverlay) authOverlay.style.display = "flex";
      if (mainApp) mainApp.style.display = "none";
      
      // Hide super admin button
      localStorage.removeItem("isSuperAdmin");
      if (superAdminBtn) superAdminBtn.style.display = "none";
      
      // Reset all data
      applyDataToState({
        customers: [],
        loans: [],
        payments: [],
        interestLogs: [],
        vendors: [],
        banks: [],
        upiIds: [],
        additionalDetails: [],
        passbookEntries: [],
      });
      loanBalanceCache = {};
    }
  });
}

// ================= SUPER ADMIN LOGIN =================

// Super Admin Credentials
const SUPER_ADMIN_USERNAME = "admin";
const SUPER_ADMIN_PASSWORD = "admin@12345";

function showAuthError(message) {
  const errorDiv = document.getElementById("authError");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  }
}

function hideAuthError() {
  const errorDiv = document.getElementById("authError");
  if (errorDiv) {
    errorDiv.style.display = "none";
  }
}

// Check if user is super admin on page load
function checkIfSuperAdmin() {
  const isSuperAdmin = localStorage.getItem("isSuperAdmin");
  if (isSuperAdmin === "true") {
    const superAdminBtn = document.getElementById("superAdminBtn");
    if (superAdminBtn) superAdminBtn.style.display = "block";
  }
}

// Updated logout
async function handleLogout() {
  localStorage.removeItem("isSuperAdmin");
  const superAdminBtn = document.getElementById("superAdminBtn");
  if (superAdminBtn) superAdminBtn.style.display = "none";
  
  try {
    if (auth) {
      await window.firebase.signOut(auth);
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
}

document.addEventListener('DOMContentLoaded', checkIfSuperAdmin);
