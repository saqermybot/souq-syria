"use client";

const DB = "souqDraftDB";
const STORE = "draft";
const KEY_TITLE = "title";
const KEY_IMAGES = "images";

function openDB() {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(new Error("DRAFT_STORAGE_BLOCKED"));
    } catch {
      reject(new Error("DRAFT_STORAGE_BLOCKED"));
    }
  });
}

async function setItem(key, val) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(val, key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(new Error("DRAFT_STORAGE_BLOCKED")); };
  });
}

async function getItem(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => { db.close(); resolve(req.result); };
    req.onerror = () => { db.close(); reject(new Error("DRAFT_STORAGE_BLOCKED")); };
  });
}

async function delItem(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(new Error("DRAFT_STORAGE_BLOCKED")); };
  });
}

export async function saveDraftTitle(title) {
  await setItem(KEY_TITLE, String(title || "").slice(0, 120));
}

export async function getDraftTitle() {
  const v = await getItem(KEY_TITLE);
  return (v || "").toString();
}

// items: [{name,type,blob}]
export async function saveDraftImagesItems(items) {
  await setItem(KEY_IMAGES, items);
}

export async function getDraftImages() {
  const v = await getItem(KEY_IMAGES);
  return Array.isArray(v) ? v : [];
}

export async function clearDraft() {
  await delItem(KEY_TITLE);
  await delItem(KEY_IMAGES);
}
