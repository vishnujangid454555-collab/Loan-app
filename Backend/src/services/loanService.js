import { formatDate } from "../utils/dateUtils.js";

/**
 * Calculate remaining loan balance (moved from Frontend/js/utils.js)
 */
export function calculateLoanBalance(loanId, loans, payments) {
  const loan = loans.find((l) => Number(l.id) === Number(loanId));
  if (!loan) return 0;

  let balance = loan.amount;
  const today = new Date();
  const start = new Date(loan.startDate);
  let cycleDate = new Date(start);

  while (true) {
    const nextCycle = new Date(cycleDate);
    if (loan.period === "monthly") {
      nextCycle.setMonth(nextCycle.getMonth() + 1);
    } else if (loan.period === "yearly") {
      nextCycle.setFullYear(nextCycle.getFullYear() + 1);
    }

    if (nextCycle > today) break;

    let interest = 0;
    if (loan.period === "monthly") {
      interest = (loan.amount * loan.rate) / 100;
    } else {
      const days = Math.round((nextCycle - cycleDate) / (1000 * 60 * 60 * 24));
      interest = (loan.amount * loan.rate * days) / 36500;
    }
    balance += interest;
    cycleDate = nextCycle;
  }

  if (cycleDate < today) {
    const days = Math.round((today - cycleDate) / (1000 * 60 * 60 * 24));
    let interest = 0;
    if (loan.period === "monthly") {
      interest = ((loan.amount * loan.rate) / 100) * (days / 30);
    } else {
      interest = (loan.amount * loan.rate * days) / 36500;
    }
    balance += interest;
  }

  payments.forEach((p) => {
    if (Number(p.loanId) === Number(loanId)) {
      balance -= p.amount;
    }
  });

  return Math.max(0, balance);
}

export function getAllLoanBalances(loans, payments) {
  const balances = {};
  loans.forEach((loan) => {
    balances[loan.id] = calculateLoanBalance(loan.id, loans, payments);
  });
  return balances;
}

export function validatePayment(loanId, amount, loans, payments) {
  const loan = loans.find((l) => Number(l.id) === Number(loanId));
  if (!loan) {
    return { valid: false, error: "Loan not found" };
  }

  const remainingBalance = calculateLoanBalance(loanId, loans, payments);
  if (amount > remainingBalance) {
    return {
      valid: false,
      error: "Payment amount cannot exceed remaining balance",
      remainingBalance: Math.round(remainingBalance),
    };
  }

  return { valid: true, remainingBalance: Math.round(remainingBalance) };
}
