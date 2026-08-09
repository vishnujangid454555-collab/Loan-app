import { Router } from "express";
import { generateAndSaveInterest } from "../services/interestService.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/generate", async (req, res, next) => {
  try {
    const data = await generateAndSaveInterest(req.user.uid);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
