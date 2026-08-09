// ================= BACKEND DATA SYNC =================
// Firestore operations moved to backend API (see backend/src/services/dataService.js)

let auth = null;
let currentUser = null;
let userDataLoaded = false;
let authListenerSetup = false;
let lastInterestGenerationTime = 0;
let isSaving = false;

// ================= AUTH ERROR DISPLAY =================
function showAuthError(message) {
  const errorDiv = document.querySelector("#authError");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    setTimeout(() => {
      errorDiv.style.display = "none";
    }, 5000);
  }
  console.error("Auth Error:", message);
}

// ================= FIREBASE AUTH INITIALIZATION =================
function initializeFirebase() {
  const maxAttempts = 50;
  let attempts = 0;

  const checkFirebase = setInterval(() => {
    attempts++;

    if (typeof window.firebaseAuth !== "undefined") {
      auth = window.firebaseAuth;
      clearInterval(checkFirebase);
      console.log("Firebase Auth initialized");

      if (!authListenerSetup) {
        authListenerSetup = true;
        setupAuthListener();
      }
      return true;
    }

    if (attempts >= maxAttempts) {
      clearInterval(checkFirebase);
      console.error("Firebase Auth failed to initialize");
      showAuthError("Firebase not loaded. Please refresh the page.");
      return false;
    }
  }, 100);

  return true;
}

document.addEventListener("DOMContentLoaded", function () {
  if (!authListenerSetup) {
    initializeFirebase();
  }
  clearAllForms();
});

window.addEventListener("beforeunload", function (e) {
  let hasUnsavedData = false;
  const inputs = document.querySelectorAll(
    'input[type="text"], input[type="email"], input[type="password"], input[type="number"], input[type="date"], textarea, select'
  );

  for (let input of inputs) {
    if (
      input.id &&
      !input.id.includes("Search") &&
      !input.id.includes("Filter") &&
      input.value.trim()
    ) {
      hasUnsavedData = true;
      break;
    }
  }

  if (hasUnsavedData) {
    e.preventDefault();
    e.returnValue = "";
    return "";
  }
});

// ================= SAVE TO BACKEND =================
async function save() {
  if (!currentUser) {
    console.log("User not logged in");
    return;
  }

  try {
    isSaving = true;

    await api.put("/data", {
      customers,
      loans,
      payments,
      interestLogs,
      vendors,
      banks,
      upiIds,
      additionalDetails,
      passbookEntries,
    });

    await refreshLoanBalances();
    console.log("Data saved via backend API");
  } catch (error) {
    console.error("Error saving data:", error);
    Swal.fire({
      icon: "error",
      title: "Save Failed",
      text: error.message || "Could not save data. Is the backend running?",
      confirmButtonColor: "#0ea5e9",
    });
  } finally {
    setTimeout(() => {
      isSaving = false;
    }, 500);
  }
}

// ================= LOAD USER DATA FROM BACKEND =================
async function loadUserDataFromFirestore() {
  if (!currentUser) return;

  try {
    const data = await api.get("/data");
    applyDataToState(data);
    await refreshLoanBalances();
    initApp();
    userDataLoaded = true;
  } catch (error) {
    console.error("Error loading user data:", error);
    Swal.fire({
      icon: "error",
      title: "Load Failed",
      text: error.message || "Could not load data. Start the backend server.",
      confirmButtonColor: "#0ea5e9",
    });
  }
}

// Real-time listener removed — data syncs via API save/load
function setupFirestoreListener() {
  userDataLoaded = true;
}
