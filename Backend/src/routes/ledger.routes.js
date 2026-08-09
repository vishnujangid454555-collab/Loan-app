import { Router } from "express";
import { getUserData } from "../services/dataService.js";
import { buildLedger } from "../services/ledgerService.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/:customerId", async (req, res, next) => {
  try {
    const data = await getUserData(req.user.uid);
    const rows = buildLedger(req.params.customerId, data);
    res.json({ rows });
  } catch (error) {
    next(error);
  }
});

export default router;
