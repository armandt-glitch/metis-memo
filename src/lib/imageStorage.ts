import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ImageStorageSchema extends DBSchema {
  images: {
    key: string;
    value: {
      id: string;
      data: string; // base64 data
      createdAt: number;
    };
  };
}

const DB_NAME = 'memo-images';
const DB_VERSION = 1;
const STORE_NAME = 'images';

let dbPromise: Promise<IDBPDatabase<ImageStorageSchema>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<ImageStorageSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

/**
 * Save an image to IndexedDB
 * @param id Unique identifier for the image
 * @param dataUrl Base64 data URL of the image
 */
export const saveImage = async (id: string, dataUrl: string): Promise<void> => {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, {
      id,
      data: dataUrl,
      createdAt: Date.now(),
    });
  } catch (error) {
    console.error('Failed to save image to IndexedDB:', error);
    throw error;
  }
};

/**
 * Get an image from IndexedDB
 * @param id Unique identifier for the image
 * @returns Base64 data URL or null if not found
 */
export const getImage = async (id: string): Promise<string | null> => {
  try {
    const db = await getDB();
    const record = await db.get(STORE_NAME, id);
    return record?.data ?? null;
  } catch (error) {
    console.error('Failed to get image from IndexedDB:', error);
    return null;
  }
};

/**
 * Delete an image from IndexedDB
 * @param id Unique identifier for the image
 */
export const deleteImage = async (id: string): Promise<void> => {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  } catch (error) {
    console.error('Failed to delete image from IndexedDB:', error);
  }
};

/**
 * Generate a unique image ID based on card ID
 * @param cardId The flashcard ID
 * @returns A unique image ID
 */
export const generateImageId = (cardId: string): string => {
  return `img_${cardId}`;
};

/**
 * Check if a mediaUrl is a reference to IndexedDB storage
 * @param mediaUrl The media URL to check
 * @returns true if it's an IndexedDB reference
 */
export const isIndexedDBRef = (mediaUrl: string): boolean => {
  return mediaUrl.startsWith('idb://');
};

/**
 * Create an IndexedDB reference URL
 * @param imageId The image ID
 * @returns The reference URL
 */
export const createIndexedDBRef = (imageId: string): string => {
  return `idb://${imageId}`;
};

/**
 * Extract image ID from IndexedDB reference URL
 * @param refUrl The reference URL
 * @returns The image ID
 */
export const extractImageId = (refUrl: string): string => {
  return refUrl.replace('idb://', '');
};

/**
 * Resolve a media URL - if it's an IndexedDB reference, load from IndexedDB
 * @param mediaUrl The media URL (can be base64, idb://, or regular URL)
 * @returns The actual displayable URL
 */
export const resolveMediaUrl = async (mediaUrl: string): Promise<string | null> => {
  if (!mediaUrl) return null;
  
  if (isIndexedDBRef(mediaUrl)) {
    const imageId = extractImageId(mediaUrl);
    return await getImage(imageId);
  }
  
  // Already a displayable URL (base64 or regular URL)
  return mediaUrl;
};

/**
 * Clean up orphaned images (images without associated cards)
 * @param validCardIds Set of valid card IDs that should have images
 */
export const cleanupOrphanedImages = async (validCardIds: Set<string>): Promise<void> => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    let cursor = await store.openCursor();
    while (cursor) {
      const imageId = cursor.value.id;
      const cardId = imageId.replace('img_', '');
      if (!validCardIds.has(cardId)) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
    
    await tx.done;
  } catch (error) {
    console.error('Failed to cleanup orphaned images:', error);
  }
};
