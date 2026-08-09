import { Router } from "express";
import dataRoutes from "./data.routes.js";
import loansRoutes from "./loans.routes.js";
import interestRoutes from "./interest.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import ledgerRoutes from "./ledger.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "loan-app-backend" });
});

router.use("/data", dataRoutes);
router.use("/loans", loansRoutes);
router.use("/interest", interestRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/ledger", ledgerRoutes);
router.use("/admin", adminRoutes);

export default router;
