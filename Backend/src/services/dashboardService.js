/**
 * Dashboard statistics (moved from Frontend/js/dashboard.js)
 */
export function getDashboardStats(data, dateFilter) {
  const totalGiven = data.loans.reduce((s, l) => s + l.amount, 0);
  const totalReceived = data.payments.reduce((s, p) => s + p.amount, 0);
  const totalInterest = data.interestLogs.reduce((s, i) => s + i.amount, 0);

  let dateInterest = 0;
  if (dateFilter) {
    dateInterest = data.interestLogs
      .filter((i) => i.date === dateFilter)
      .reduce((s, i) => s + i.amount, 0);
  }

  return {
    given: Math.round(totalGiven),
    received: Math.round(totalReceived),
    pending: Math.round(totalGiven + totalInterest - totalReceived),
    interest: Math.round(totalInterest),
    dateInterest: Math.round(dateInterest),
  };
}
