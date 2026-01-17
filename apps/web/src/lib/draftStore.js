"use client";

/**
 * IndexedDB draft storage for post wizard
 * Stores: title + images (as blobs) between pages safely (iPhone/Android)
 */

const DB = "souqDraftDB";
const STORE = "draft";
const KEY_TITLE = "title";
const KEY_IMAGES = "images";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function setItem(key, val) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(val, key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function getItem(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => { db.close(); resolve(req.result); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

async function delItem(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function saveDraftTitle(title) {
  await setItem(KEY_TITLE, String(title || "").slice(0, 120));
}

export async function getDraftTitle() {
  const v = await getItem(KEY_TITLE);
  return (v || "").toString();
}

export async function saveDraftImages(fileList) {
  const files = Array.from(fileList || []).slice(0, 5);
  const items = [];
  for (const f of files) {
    const blob = new Blob([await f.arrayBuffer()], { type: f.type || "application/octet-stream" });
    items.push({ name: f.name || "image", type: f.type || "image/jpeg", blob });
  }
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
