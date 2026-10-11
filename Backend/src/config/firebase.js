import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localServiceAccountPath = path.join(__dirname, "../../serviceAccountKey.json");
let initialized = false;

function getServiceAccount() {
  const envCredentials = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (envCredentials && envCredentials.trim()) {
    try {
      return JSON.parse(envCredentials);
    } catch (error) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT is not valid JSON. Please provide valid Firebase service account credentials."
      );
    }
  }

  if (fs.existsSync(localServiceAccountPath)) {
    const fileContents = fs.readFileSync(localServiceAccountPath, "utf8");
    return JSON.parse(fileContents);
  }

  return null;
}

export function initializeFirebaseAdmin() {
  if (initialized) {
    return admin;
  }

  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    throw new Error(
      "Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT or add the local serviceAccountKey.json file for development."
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
  return admin;
}

export function getFirestore() {
  initializeFirebaseAdmin();
  return admin.firestore();
}

export function getAuth() {
  initializeFirebaseAdmin();
  return admin.auth();
}