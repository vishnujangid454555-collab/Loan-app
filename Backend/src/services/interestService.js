import { formatDate } from "../utils/dateUtils.js";
import { getUserData, saveUserData } from "./dataService.js";

let lastInterestGenerationTime = 0;

/**
 * Generate interest logs (moved from Frontend/js/dashboard.js)
 */
export function generateInterestForData(data) {
  const now = Date.now();
  if (now - lastInterestGenerationTime < 5000) {
    return { data, skipped: true };
  }
  lastInterestGenerationTime = now;

  const today = new Date();
  const { loans, interestLogs } = data;

  loans.forEach((loan) => {
    let cycleDate = new Date(loan.startDate);

    while (true) {
      const nextCycle = new Date(cycleDate);

      if (loan.period === "monthly") {
        nextCycle.setMonth(nextCycle.getMonth() + 1);
      } else if (loan.period === "yearly") {
        nextCycle.setFullYear(nextCycle.getFullYear() + 1);
      }

      if (nextCycle > today) break;

      const d = formatDate(nextCycle);
      const exists = interestLogs.some(
        (i) => Number(i.loanId) === Number(loan.id) && i.date === d
      );

      if (!exists) {
        const interest = (loan.amount * loan.rate) / 100;
        interestLogs.push({
          loanId: loan.id,
          date: d,
          amount: interest,
        });
      }

      cycleDate = nextCycle;
    }

    loan.lastInterestDate = formatDate(today);
  });

  return { data, skipped: false };
}

export async function generateAndSaveInterest(uid) {
  const data = await getUserData(uid);
  const result = generateInterestForData(data);

  if (!result.skipped) {
    await saveUserData(uid, result.data);
  }

  return result.data;
}
