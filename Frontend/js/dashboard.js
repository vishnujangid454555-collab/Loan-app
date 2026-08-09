// ================= DASHBOARD =================
// Stats computed locally for fast UI; backend mirrors this in dashboardService.js

function updateDashboard() {
  let totalGiven = loans.reduce((s, l) => s + l.amount, 0);
  let totalReceived = payments.reduce((s, p) => s + p.amount, 0);
  let totalInterest = interestLogs.reduce((s, i) => s + i.amount, 0);

  given.innerText = Math.round(totalGiven);
  received.innerText = Math.round(totalReceived);
  pending.innerText = Math.round(totalGiven + totalInterest - totalReceived);
  interest.innerText = Math.round(totalInterest);
}

// ================= INTEREST (backend: interestService.js) =================
async function generateInterest() {
  let now = Date.now();
  if (now - lastInterestGenerationTime < 5000) {
    console.log("Interest generation called too frequently, skipping...");
    return;
  }
  lastInterestGenerationTime = now;

  try {
    const result = await api.post("/interest/generate");
    if (result.data) {
      applyDataToState(result.data);
      await refreshLoanBalances();
      updateDashboard();
    }
  } catch (error) {
    console.error("Interest generation failed:", error);
  }
}

// DATE FILTER
if (document.getElementById("dateFilter")) {
  document.getElementById("dateFilter").addEventListener("change", function () {
    let d = this.value;
    let total = interestLogs
      .filter((i) => i.date === d)
      .reduce((s, i) => s + i.amount, 0);
    let dateInterestEl = document.getElementById("dateInterest");
    if (dateInterestEl) {
      dateInterestEl.innerText = Math.round(total);
    }
  });
}
