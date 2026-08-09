import { getAuth } from "../config/firebase.js";

export async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  try {
    // Check if it's a Super Admin local token
    if (token === "super-admin-token-local") {
      req.user = {
        uid: "super-admin-uid",
        email: "superadmin@loanapp.local",
        isSuperAdmin: true,
      };
      next();
      return;
    }

    // Otherwise verify as Firebase ID token
    const decoded = await getAuth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
