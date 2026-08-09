import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getAuth } from "../config/firebase.js";
import { getUserData } from "../services/dataService.js";

const router = Router();

function getConfiguredSuperAdmins() {
  return (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

async function isSuperAdminUser(uid, email) {
  const configuredAdmins = getConfiguredSuperAdmins();
  if (configuredAdmins.includes(email?.toLowerCase())) {
    return true;
  }

  try {
    const userRecord = await getAuth().getUser(uid);
    const claims = userRecord.customClaims || {};
    return Boolean(
      claims.role === "super_admin" ||
        claims.superAdmin === true ||
        claims.admin === true
    );
  } catch (error) {
    return false;
  }
}

router.use(authenticate);

router.get("/me", async (req, res, next) => {
  try {
    const superAdmin = await isSuperAdminUser(req.user.uid, req.user.email);
    res.json({
      uid: req.user.uid,
      email: req.user.email || null,
      isSuperAdmin: superAdmin,
      role: superAdmin ? "super_admin" : "user",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const superAdmin = await isSuperAdminUser(req.user.uid, req.user.email);
    if (!superAdmin) {
      return res.status(403).json({ error: "Super admin access required" });
    }

    const result = await getAuth().listUsers(1000);
    const users = await Promise.all(
      result.users.map(async (userRecord) => {
        const userData = await getUserData(userRecord.uid);
        const counts = {
          customers: userData.customers?.length || 0,
          loans: userData.loans?.length || 0,
          payments: userData.payments?.length || 0,
          vendors: userData.vendors?.length || 0,
          banks: userData.banks?.length || 0,
          upiIds: userData.upiIds?.length || 0,
        };

        return {
          uid: userRecord.uid,
          email: userRecord.email || "No email",
          displayName: userRecord.displayName || "",
          disabled: Boolean(userRecord.disabled),
          emailVerified: Boolean(userRecord.emailVerified),
          lastSignInTime: userRecord.metadata?.lastSignInTime || null,
          createdAt: userRecord.metadata?.creationTime || null,
          role: userRecord.customClaims?.role || "user",
          dataCounts: counts,
        };
      })
    );

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

export default router;
