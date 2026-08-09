import { Router } from "express";
import { getUserData, saveUserData } from "../services/dataService.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const data = await getUserData(req.user.uid);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.put("/", async (req, res, next) => {
  try {
    const data = await saveUserData(req.user.uid, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
