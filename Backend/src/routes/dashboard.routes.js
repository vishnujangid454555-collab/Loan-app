import { Router } from "express";
import { getUserData } from "../services/dataService.js";
import { getDashboardStats } from "../services/dashboardService.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const data = await getUserData(req.user.uid);
    const stats = getDashboardStats(data, req.query.date);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;
