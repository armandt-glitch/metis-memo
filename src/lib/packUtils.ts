import JSZip from 'jszip';
import { PackManifest, PackCard, DEMO_PACKS } from '@/types/pack';
import { savePackMedia } from './packDb';

export interface ValidatedPack {
  manifest: PackManifest;
  cards: PackCard[];
  mediaFiles: Map<string, Blob>;
}

const MAX_PACK_SIZE = 200 * 1024 * 1024; // 200MB

export async function validatePackZip(zipBlob: Blob): Promise<ValidatedPack> {
  if (zipBlob.size > MAX_PACK_SIZE) {
    throw new Error(`Le pack est trop volumineux (max ${MAX_PACK_SIZE / 1024 / 1024}MB)`);
  }

  const zip = await JSZip.loadAsync(zipBlob);
  
  // Check manifest.json
  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) {
    throw new Error('manifest.json manquant dans le pack');
  }
  
  const manifestContent = await manifestFile.async('string');
  let manifest: PackManifest;
  try {
    manifest = JSON.parse(manifestContent);
  } catch {
    throw new Error('manifest.json invalide');
  }
  
  // Validate required fields
  if (!manifest.packId || !manifest.title || !manifest.cardCount) {
    throw new Error('manifest.json incomplet (packId, title, cardCount requis)');
  }
  
  // Check cards.json
  const cardsFile = zip.file('cards.json');
  if (!cardsFile) {
    throw new Error('cards.json manquant dans le pack');
  }
  
  const cardsContent = await cardsFile.async('string');
  let cards: PackCard[];
  try {
    cards = JSON.parse(cardsContent);
  } catch {
    throw new Error('cards.json invalide');
  }
  
  if (!Array.isArray(cards)) {
    throw new Error('cards.json doit contenir un tableau');
  }
  
  // Extract media files
  const mediaFiles = new Map<string, Blob>();
  const mediaFolder = zip.folder('media');
  
  if (mediaFolder) {
    const mediaEntries = Object.entries(zip.files).filter(
      ([path]) => path.startsWith('media/') && !path.endsWith('/')
    );
    
    for (const [path, file] of mediaEntries) {
      if (!file.dir) {
        const blob = await file.async('blob');
        const filename = path.replace('media/', '');
        mediaFiles.set(filename, blob);
      }
    }
  }
  
  // Verify all referenced media exists
  for (const card of cards) {
    if (card.imagePath && !mediaFiles.has(card.imagePath)) {
      console.warn(`Image manquante: ${card.imagePath}`);
    }
    if (card.audioPath && !mediaFiles.has(card.audioPath)) {
      console.warn(`Audio manquant: ${card.audioPath}`);
    }
  }
  
  return { manifest, cards, mediaFiles };
}

export async function savePackMediaFiles(
  packId: string,
  mediaFiles: Map<string, Blob>
): Promise<void> {
  for (const [filename, blob] of mediaFiles) {
    const mimeType = getMimeType(filename);
    await savePackMedia(packId, filename, blob, mimeType);
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'ogg':
      return 'audio/ogg';
    case 'm4a':
      return 'audio/mp4';
    default:
      return 'application/octet-stream';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getAvailablePacks(): PackManifest[] {
  return DEMO_PACKS;
}

export function getPackById(packId: string): PackManifest | undefined {
  return DEMO_PACKS.find(p => p.packId === packId);
}

// Generate demo pack data for simulation
export function generateDemoPackCards(packId: string): PackCard[] {
  const pack = DEMO_PACKS.find(p => p.packId === packId);
  if (!pack) return [];
  
  // For demo, we'll generate cards based on the theme
  switch (packId) {
    case 'capitals-europe':
      return [
        { id: 'cap-1', frontText: 'Quelle est la capitale de la France ?', backText: 'Paris', hints: ['Tour Eiffel'] },
        { id: 'cap-2', frontText: 'Quelle est la capitale de l\'Allemagne ?', backText: 'Berlin', hints: ['Mur historique'] },
        { id: 'cap-3', frontText: 'Quelle est la capitale de l\'Italie ?', backText: 'Rome', hints: ['Colisée'] },
        { id: 'cap-4', frontText: 'Quelle est la capitale de l\'Espagne ?', backText: 'Madrid', hints: ['Real'] },
        { id: 'cap-5', frontText: 'Quelle est la capitale du Portugal ?', backText: 'Lisbonne', hints: ['Pastéis de nata'] },
        { id: 'cap-6', frontText: 'Quelle est la capitale du Royaume-Uni ?', backText: 'Londres', hints: ['Big Ben'] },
        { id: 'cap-7', frontText: 'Quelle est la capitale des Pays-Bas ?', backText: 'Amsterdam', hints: ['Canaux'] },
        { id: 'cap-8', frontText: 'Quelle est la capitale de la Belgique ?', backText: 'Bruxelles', hints: ['Atomium'] },
        { id: 'cap-9', frontText: 'Quelle est la capitale de la Suisse ?', backText: 'Berne', hints: ['Pas Genève !'] },
        { id: 'cap-10', frontText: 'Quelle est la capitale de l\'Autriche ?', backText: 'Vienne', hints: ['Mozart'] },
        { id: 'cap-11', frontText: 'Quelle est la capitale de la Pologne ?', backText: 'Varsovie', hints: ['Wisła'] },
        { id: 'cap-12', frontText: 'Quelle est la capitale de la Suède ?', backText: 'Stockholm', hints: ['IKEA'] },
        { id: 'cap-13', frontText: 'Quelle est la capitale de la Norvège ?', backText: 'Oslo', hints: ['Fjords'] },
        { id: 'cap-14', frontText: 'Quelle est la capitale de la Finlande ?', backText: 'Helsinki', hints: ['Nokia'] },
        { id: 'cap-15', frontText: 'Quelle est la capitale de la Grèce ?', backText: 'Athènes', hints: ['Parthénon'] },
      ];
    
    case 'english-verbs-irregular':
      return [
        { id: 'verb-1', frontText: 'be', backText: 'was/were - been (être)' },
        { id: 'verb-2', frontText: 'begin', backText: 'began - begun (commencer)' },
        { id: 'verb-3', frontText: 'break', backText: 'broke - broken (casser)' },
        { id: 'verb-4', frontText: 'bring', backText: 'brought - brought (apporter)' },
        { id: 'verb-5', frontText: 'buy', backText: 'bought - bought (acheter)' },
        { id: 'verb-6', frontText: 'catch', backText: 'caught - caught (attraper)' },
        { id: 'verb-7', frontText: 'choose', backText: 'chose - chosen (choisir)' },
        { id: 'verb-8', frontText: 'come', backText: 'came - come (venir)' },
        { id: 'verb-9', frontText: 'do', backText: 'did - done (faire)' },
        { id: 'verb-10', frontText: 'drink', backText: 'drank - drunk (boire)' },
        { id: 'verb-11', frontText: 'drive', backText: 'drove - driven (conduire)' },
        { id: 'verb-12', frontText: 'eat', backText: 'ate - eaten (manger)' },
        { id: 'verb-13', frontText: 'fall', backText: 'fell - fallen (tomber)' },
        { id: 'verb-14', frontText: 'feel', backText: 'felt - felt (ressentir)' },
        { id: 'verb-15', frontText: 'find', backText: 'found - found (trouver)' },
        { id: 'verb-16', frontText: 'fly', backText: 'flew - flown (voler)' },
        { id: 'verb-17', frontText: 'forget', backText: 'forgot - forgotten (oublier)' },
        { id: 'verb-18', frontText: 'get', backText: 'got - got/gotten (obtenir)' },
        { id: 'verb-19', frontText: 'give', backText: 'gave - given (donner)' },
        { id: 'verb-20', frontText: 'go', backText: 'went - gone (aller)' },
        { id: 'verb-21', frontText: 'have', backText: 'had - had (avoir)' },
        { id: 'verb-22', frontText: 'know', backText: 'knew - known (savoir)' },
        { id: 'verb-23', frontText: 'make', backText: 'made - made (faire/fabriquer)' },
        { id: 'verb-24', frontText: 'run', backText: 'ran - run (courir)' },
        { id: 'verb-25', frontText: 'see', backText: 'saw - seen (voir)' },
      ];
    
    case 'anatomy-basics':
      return [
        { id: 'anat-1', frontText: 'Quel organe pompe le sang dans le corps ?', backText: 'Le cœur' },
        { id: 'anat-2', frontText: 'Quel est le plus grand organe du corps humain ?', backText: 'La peau' },
        { id: 'anat-3', frontText: 'Combien d\'os composent le squelette humain adulte ?', backText: '206 os' },
        { id: 'anat-4', frontText: 'Quel organe filtre le sang et produit l\'urine ?', backText: 'Les reins' },
        { id: 'anat-5', frontText: 'Quel est l\'organe principal de la respiration ?', backText: 'Les poumons' },
        { id: 'anat-6', frontText: 'Quel organe produit l\'insuline ?', backText: 'Le pancréas' },
        { id: 'anat-7', frontText: 'Quel est le plus gros organe interne ?', backText: 'Le foie' },
        { id: 'anat-8', frontText: 'Où sont produits les globules rouges ?', backText: 'Dans la moelle osseuse' },
        { id: 'anat-9', frontText: 'Quel muscle permet de respirer ?', backText: 'Le diaphragme' },
        { id: 'anat-10', frontText: 'Combien de vertèbres composent la colonne vertébrale ?', backText: '33 vertèbres' },
        { id: 'anat-11', frontText: 'Quel est le plus petit os du corps humain ?', backText: 'L\'étrier (dans l\'oreille)' },
        { id: 'anat-12', frontText: 'Où se situe le cervelet ?', backText: 'À l\'arrière du crâne, sous le cerveau' },
        { id: 'anat-13', frontText: 'Quel est le rôle de la rate ?', backText: 'Filtrer le sang et recycler les globules rouges' },
        { id: 'anat-14', frontText: 'Combien de dents a un adulte ?', backText: '32 dents' },
        { id: 'anat-15', frontText: 'Quel est l\'os le plus long du corps ?', backText: 'Le fémur' },
        { id: 'anat-16', frontText: 'Où se trouve l\'appendice ?', backText: 'En bas à droite de l\'abdomen' },
        { id: 'anat-17', frontText: 'Quel organe produit la bile ?', backText: 'Le foie' },
        { id: 'anat-18', frontText: 'Combien de lobes a le poumon droit ?', backText: '3 lobes' },
        { id: 'anat-19', frontText: 'Quel est le rôle de la thyroïde ?', backText: 'Réguler le métabolisme' },
        { id: 'anat-20', frontText: 'Où se situent les amygdales ?', backText: 'Dans la gorge' },
      ];
    
    default:
      return [];
  }
}
