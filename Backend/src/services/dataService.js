import { getFirestore } from "../config/firebase.js";

const EMPTY_DATA = {
  customers: [],
  loans: [],
  payments: [],
  interestLogs: [],
  vendors: [],
  banks: [],
  upiIds: [],
  additionalDetails: [],
  passbookEntries: [],
};

function dataDocRef(uid) {
  return getFirestore().doc(`users/${uid}/appData/mainData`);
}

export async function getUserData(uid) {
  const snap = await dataDocRef(uid).get();

  if (!snap.exists) {
    return { ...EMPTY_DATA };
  }

  const data = snap.data();
  return normalizeData(data);
}

export async function saveUserData(uid, payload) {
  const data = normalizeData(payload);

  await dataDocRef(uid).set({
    ...data,
    lastUpdated: new Date(),
  });

  return data;
}

function normalizeData(data) {
  const normalized = {
    customers: data.customers || [],
    loans: data.loans || [],
    payments: data.payments || [],
    interestLogs: data.interestLogs || [],
    vendors: data.vendors || [],
    banks: data.banks || [],
    upiIds: data.upiIds || [],
    additionalDetails: data.additionalDetails || [],
    passbookEntries: data.passbookEntries || [],
  };

  normalized.customers.forEach((c) => {
    if (c.locked === undefined) c.locked = false;
  });
  normalized.loans.forEach((l) => {
    if (l.locked === undefined) l.locked = false;
  });
  normalized.vendors.forEach((v) => {
    if (v.locked === undefined) v.locked = false;
  });
  normalized.banks.forEach((b) => {
    if (b.locked === undefined) b.locked = false;
  });
  normalized.upiIds.forEach((u) => {
    if (u.locked === undefined) u.locked = false;
  });

  return normalized;
}
