// ================= API CLIENT =================
// Communicates with the Express backend (replaces direct Firestore access)

const API_BASE_URL = window.LOAN_APP_API_URL || (
  window.location.protocol === "file:" ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"
    : "https://loan-app-backend-api.onrender.com/api"
);

async function getAuthToken() {
  if (!currentUser) return null;
  
  // Handle Super Admin login (no Firebase token needed)
  if (currentUser.isSuperAdmin === true) {
    return "super-admin-token-local";
  }
  
  // Regular Firebase users have getIdToken method
  if (typeof currentUser.getIdToken === 'function') {
    return currentUser.getIdToken();
  }
  
  return null;
}

async function apiRequest(method, path, body) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}

const api = {
  get: (path) => apiRequest("GET", path),
  put: (path, body) => apiRequest("PUT", path, body),
  post: (path, body) => apiRequest("POST", path, body),
};

// Loan balance cache (populated from backend)
let loanBalanceCache = {};

async function refreshLoanBalances() {
  try {
    const result = await api.get("/loans/balances");
    loanBalanceCache = result.balances || {};
  } catch (error) {
    console.error("Failed to refresh loan balances:", error);
    loanBalanceCache = {};
  }
}

function calculateLoanBalance(loanId) {
  return loanBalanceCache[loanId] ?? 0;
}

function applyDataToState(data) {
  customers = data.customers || [];
  loans = data.loans || [];
  payments = data.payments || [];
  interestLogs = data.interestLogs || [];
  vendors = data.vendors || [];
  banks = data.banks || [];
  upiIds = data.upiIds || [];
  additionalDetails = data.additionalDetails || [];
  passbookEntries = data.passbookEntries || [];
}
