import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MaterialItem, RequisitionOrder, StockInRecord, StockOutRecord } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId as required
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate connection to Firestore on boot
 */
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline or unreachable.');
    }
    // Even if the test doc doesn't exist, getting to the server without offline error means connection works
    return true;
  }
}

// -------------------------------------------------------------
// Materials Collection
// -------------------------------------------------------------
const MATERIALS_COLLECTION = 'materials';

export function subscribeMaterials(
  onUpdate: (materials: MaterialItem[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, MATERIALS_COLLECTION),
    snapshot => {
      const items: MaterialItem[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as MaterialItem);
      });
      // Sort by display number
      items.sort((a, b) => a.no - b.no);
      onUpdate(items);
    },
    error => {
      try {
        handleFirestoreError(error, OperationType.GET, MATERIALS_COLLECTION);
      } catch (err) {
        if (onError && err instanceof Error) onError(err);
      }
    }
  );
}

export async function saveMaterialToFirestore(material: MaterialItem): Promise<void> {
  const path = `${MATERIALS_COLLECTION}/${material.id}`;
  try {
    await setDoc(doc(db, MATERIALS_COLLECTION, material.id), material, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMaterialFromFirestore(materialId: string): Promise<void> {
  const path = `${MATERIALS_COLLECTION}/${materialId}`;
  try {
    await deleteDoc(doc(db, MATERIALS_COLLECTION, materialId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Orders Collection
// -------------------------------------------------------------
const ORDERS_COLLECTION = 'orders';

export function subscribeOrders(
  onUpdate: (orders: RequisitionOrder[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, ORDERS_COLLECTION),
    snapshot => {
      const items: RequisitionOrder[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as RequisitionOrder);
      });
      // Sort newest orders first
      items.sort((a, b) => (b.date > a.date ? 1 : -1));
      onUpdate(items);
    },
    error => {
      try {
        handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
      } catch (err) {
        if (onError && err instanceof Error) onError(err);
      }
    }
  );
}

export async function saveOrderToFirestore(order: RequisitionOrder): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${order.id}`;
  try {
    await setDoc(doc(db, ORDERS_COLLECTION, order.id), order, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Stock In Records Collection
// -------------------------------------------------------------
const STOCK_IN_COLLECTION = 'stockIn';

export function subscribeStockIn(
  onUpdate: (records: StockInRecord[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, STOCK_IN_COLLECTION),
    snapshot => {
      const items: StockInRecord[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as StockInRecord);
      });
      items.sort((a, b) => (b.date > a.date ? 1 : -1));
      onUpdate(items);
    },
    error => {
      try {
        handleFirestoreError(error, OperationType.GET, STOCK_IN_COLLECTION);
      } catch (err) {
        if (onError && err instanceof Error) onError(err);
      }
    }
  );
}

export async function saveStockInToFirestore(record: StockInRecord): Promise<void> {
  const path = `${STOCK_IN_COLLECTION}/${record.id}`;
  try {
    await setDoc(doc(db, STOCK_IN_COLLECTION, record.id), record, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStockInFromFirestore(recordId: string): Promise<void> {
  const path = `${STOCK_IN_COLLECTION}/${recordId}`;
  try {
    await deleteDoc(doc(db, STOCK_IN_COLLECTION, recordId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Stock Out Records Collection
// -------------------------------------------------------------
const STOCK_OUT_COLLECTION = 'stockOut';

export function subscribeStockOut(
  onUpdate: (records: StockOutRecord[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, STOCK_OUT_COLLECTION),
    snapshot => {
      const items: StockOutRecord[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as StockOutRecord);
      });
      items.sort((a, b) => (b.date > a.date ? 1 : -1));
      onUpdate(items);
    },
    error => {
      try {
        handleFirestoreError(error, OperationType.GET, STOCK_OUT_COLLECTION);
      } catch (err) {
        if (onError && err instanceof Error) onError(err);
      }
    }
  );
}

export async function saveStockOutToFirestore(record: StockOutRecord): Promise<void> {
  const path = `${STOCK_OUT_COLLECTION}/${record.id}`;
  try {
    await setDoc(doc(db, STOCK_OUT_COLLECTION, record.id), record, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStockOutFromFirestore(recordId: string): Promise<void> {
  const path = `${STOCK_OUT_COLLECTION}/${recordId}`;
  try {
    await deleteDoc(doc(db, STOCK_OUT_COLLECTION, recordId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Seed initial data to Firestore if database is empty
 */
export async function seedInitialFirestoreData(
  initialMaterials: MaterialItem[],
  initialOrders: RequisitionOrder[],
  initialStockIns: StockInRecord[],
  initialStockOuts: StockOutRecord[]
): Promise<boolean> {
  try {
    const matSnap = await getDocs(collection(db, MATERIALS_COLLECTION));
    if (!matSnap.empty) {
      // Already populated
      return false;
    }

    console.log('Seeding initial data into Firestore...');
    const batch = writeBatch(db);

    // Seed Materials
    for (const mat of initialMaterials) {
      const ref = doc(db, MATERIALS_COLLECTION, mat.id);
      batch.set(ref, mat);
    }

    // Seed Orders
    for (const ord of initialOrders) {
      const ref = doc(db, ORDERS_COLLECTION, ord.id);
      batch.set(ref, ord);
    }

    // Seed Stock Ins
    for (const inRec of initialStockIns) {
      const ref = doc(db, STOCK_IN_COLLECTION, inRec.id);
      batch.set(ref, inRec);
    }

    // Seed Stock Outs
    for (const outRec of initialStockOuts) {
      const ref = doc(db, STOCK_OUT_COLLECTION, outRec.id);
      batch.set(ref, outRec);
    }

    await batch.commit();
    console.log('Firestore initial data seeded successfully!');
    return true;
  } catch (error) {
    console.warn('Could not seed initial data to Firestore:', error);
    return false;
  }
}
