import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { InstalledPack } from '@/types/pack';

interface PacksDB extends DBSchema {
  installedPacks: {
    key: string;
    value: InstalledPack;
    indexes: { 'by-installedAt': Date };
  };
  packMedia: {
    key: string; // format: packId::filename
    value: {
      id: string; // packId::filename
      packId: string;
      filename: string;
      blob: Blob;
      mimeType: string;
    };
    indexes: { 'by-packId': string };
  };
}

const DB_NAME = 'metis-memo-packs';
const DB_VERSION = 2;

let dbInstance: IDBPDatabase<PacksDB> | null = null;

export async function getPacksDb(): Promise<IDBPDatabase<PacksDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<PacksDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Delete old stores if upgrading
      if (oldVersion < 2) {
        if (db.objectStoreNames.contains('packMedia')) {
          db.deleteObjectStore('packMedia');
        }
        if (db.objectStoreNames.contains('installedPacks')) {
          db.deleteObjectStore('installedPacks');
        }
      }

      // Store for installed packs metadata
      if (!db.objectStoreNames.contains('installedPacks')) {
        const packStore = db.createObjectStore('installedPacks', {
          keyPath: 'packId',
        });
        packStore.createIndex('by-installedAt', 'installedAt');
      }

      // Store for media files (images, audio)
      if (!db.objectStoreNames.contains('packMedia')) {
        const mediaStore = db.createObjectStore('packMedia', {
          keyPath: 'id',
        });
        mediaStore.createIndex('by-packId', 'packId');
      }
    },
  });

  return dbInstance;
}

export async function saveInstalledPack(pack: InstalledPack): Promise<void> {
  const db = await getPacksDb();
  await db.put('installedPacks', pack);
}

export async function getInstalledPack(packId: string): Promise<InstalledPack | undefined> {
  const db = await getPacksDb();
  return db.get('installedPacks', packId);
}

export async function getAllInstalledPacks(): Promise<InstalledPack[]> {
  const db = await getPacksDb();
  return db.getAll('installedPacks');
}

export async function deleteInstalledPack(packId: string): Promise<void> {
  const db = await getPacksDb();
  
  // Delete pack metadata
  await db.delete('installedPacks', packId);
  
  // Delete all associated media
  const tx = db.transaction('packMedia', 'readwrite');
  const index = tx.store.index('by-packId');
  const mediaItems = await index.getAll(packId);
  
  for (const media of mediaItems) {
    await tx.store.delete(media.id);
  }
  
  await tx.done;
}

export async function savePackMedia(
  packId: string,
  filename: string,
  blob: Blob,
  mimeType: string
): Promise<void> {
  const db = await getPacksDb();
  const id = `${packId}::${filename}`;
  await db.put('packMedia', { id, packId, filename, blob, mimeType });
}

export async function getPackMedia(
  packId: string,
  filename: string
): Promise<Blob | undefined> {
  const db = await getPacksDb();
  const id = `${packId}::${filename}`;
  const media = await db.get('packMedia', id);
  return media?.blob;
}

export async function getPackMediaUrl(
  packId: string,
  filename: string
): Promise<string | undefined> {
  const blob = await getPackMedia(packId, filename);
  if (!blob) return undefined;
  return URL.createObjectURL(blob);
}

export async function isPackInstalled(packId: string): Promise<boolean> {
  const pack = await getInstalledPack(packId);
  return !!pack;
}
