import { Router } from "express";
import { getUserData } from "../services/dataService.js";
import {
  calculateLoanBalance,
  getAllLoanBalances,
  validatePayment,
} from "../services/loanService.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/balances", async (req, res, next) => {
  try {
    const data = await getUserData(req.user.uid);
    const balances = getAllLoanBalances(data.loans, data.payments);
    res.json({ balances });
  } catch (error) {
    next(error);
  }
});

router.get("/:loanId/balance", async (req, res, next) => {
  try {
    const data = await getUserData(req.user.uid);
    const balance = calculateLoanBalance(
      req.params.loanId,
      data.loans,
      data.payments
    );
    res.json({ loanId: Number(req.params.loanId), balance: Math.round(balance) });
  } catch (error) {
    next(error);
  }
});

router.post("/validate-payment", async (req, res, next) => {
  try {
    const { loanId, amount } = req.body;
    const data = await getUserData(req.user.uid);
    const result = validatePayment(loanId, Number(amount), data.loans, data.payments);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
