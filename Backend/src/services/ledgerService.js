import { formatDate } from "../utils/dateUtils.js";

/**
 * Customer ledger (moved from Frontend/js/passbook.js)
 */
export function buildLedger(customerId, data) {
  const cid = Number(customerId);
  const rows = [];
  const today = new Date();

  const customerLoans = data.loans.filter(
    (l) => Number(l.customerId) === cid
  );

  customerLoans.forEach((l) => {
    rows.push({
      date: l.startDate,
      type: "Loan",
      amount: l.amount,
      loanNo: l.loanNo,
    });

    let start = new Date(l.startDate);
    let cycleDate = new Date(start);

    while (true) {
      const nextCycle = new Date(cycleDate);
      nextCycle.setMonth(nextCycle.getMonth() + 1);

      if (nextCycle > today) break;

      let interest = 0;
      if (l.period === "monthly") {
        interest = (l.amount * l.rate) / 100;
      } else {
        const days = Math.round((nextCycle - cycleDate) / (1000 * 60 * 60 * 24));
        interest = (l.amount * l.rate * days) / 36500;
      }

      rows.push({
        date: formatDate(nextCycle),
        type: "Interest",
        amount: interest,
        loanNo: l.loanNo,
      });

      cycleDate = nextCycle;
    }

    if (cycleDate < today) {
      const days = Math.round((today - cycleDate) / (1000 * 60 * 60 * 24));
      let interest = 0;

      if (l.period === "monthly") {
        interest = ((l.amount * l.rate) / 100) * (days / 30);
      } else {
        interest = (l.amount * l.rate * days) / 36500;
      }

      rows.push({
        date: formatDate(today),
        type: "Interest",
        amount: interest,
        loanNo: l.loanNo,
      });
    }
  });

  data.payments.forEach((p) => {
    const loan = data.loans.find((l) => Number(l.id) === Number(p.loanId));
    if (loan && Number(loan.customerId) === cid) {
      rows.push({
        date: p.date,
        type: "Payment",
        amount: p.amount,
        loanNo: loan.loanNo,
      });
    }
  });

  rows.sort((a, b) => new Date(a.date) - new Date(b.date));

  let balance = 0;
  const ledgerRows = rows.map((r) => {
    if (r.type === "Payment") balance -= r.amount;
    else balance += r.amount;

    return {
      date: r.date,
      loanNo: String(r.loanNo || 0).padStart(3, "0"),
      type: r.type,
      amount: Math.round(r.amount),
      balance: Math.round(balance),
    };
  });

  return ledgerRows;
}
