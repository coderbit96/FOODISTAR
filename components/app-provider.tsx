"use client";

import type {
  User,
  Unsubscribe
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { createGoogleProvider, getClientAuth, getClientFirestore, getClientStorage, initializeFirebaseAnalytics } from "@/lib/firebase";
import { seedData } from "@/lib/catalog";
import type {
  AdminActionLog,
  CancellationPolicy,
  CartItem,
  RasoiGoData,
  MenuItem,
  Order,
  OrderStatus,
  RefundRecord,
  Shop,
  SupportLog,
  UserProfile,
  UserRole
} from "@/lib/types";

type AuthInput = {
  fullName: string;
  email: string;
  password: string;
  mobile?: string;
  role: UserRole;
};

type AddItemInput = {
  id?: string;
  name: string;
  category: string;
  foodType: "veg" | "non veg";
  price: number;
  description: string;
  available?: boolean;
  imageFile?: File | null;
};

type SaveAddressInput = {
  id?: string;
  label: string;
  line1: string;
  city: string;
  landmark?: string;
  default?: boolean;
};

type AppContextValue = {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  data: RasoiGoData;
  cart: CartItem[];
  cartTotal: number;
  favorites: string[];
  signUp: (input: AuthInput) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (role?: UserRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (patch: Partial<Omit<UserProfile, "uid" | "email">>) => void;
  saveAddress: (input: SaveAddressInput) => void;
  deleteAddress: (addressId: string) => void;
  recordSearch: (term: string) => void;
  addToCart: (item: MenuItem, quantity: number) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  toggleFavorite: (itemId: string) => void;
  placeOrder: (input: {
    address: string;
    addressId?: string;
    note?: string;
    scheduledFor?: string;
    couponCode?: string;
    paymentMethod?: "cash" | "razorpay";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }) => Order;
  cancelOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addOwnerItem: (input: AddItemInput) => Promise<void>;
  updateOwnerItem: (input: AddItemInput) => Promise<void>;
  deleteOwnerItem: (itemId: string) => void;
  updateOwnerShop: (input: Partial<Shop> & { imageFile?: File | null }) => Promise<void>;
  acceptDeliveryOrder: (orderId: string) => void;
  updateDeliveryLocation: (orderId: string) => void;
  markDeliveredWithOtp: (orderId: string, otp: string) => void;
  rateOrderItem: (orderId: string, itemId: string, rating: number) => void;
  reviewOrderShop: (orderId: string, shopId: string, rating: number, comment: string) => void;
  clearNotifications: () => void;
  createSupportTicket: (input: Pick<SupportLog, "orderId" | "category" | "subject" | "message" | "priority">) => void;
  adminUpdateUserRole: (uid: string, role: UserRole) => void;
  adminToggleUserSuspended: (uid: string) => void;
  adminDeleteUser: (uid: string) => void;
  adminDeleteShop: (shopId: string) => void;
  adminDeleteItem: (itemId: string) => void;
  adminDeleteOrder: (orderId: string) => void;
  adminClearActivity: () => void;
  adminClearNonAdmins: () => void;
  adminCreateSupportTicket: (input: Pick<SupportLog, "userId" | "orderId" | "category" | "subject" | "message" | "priority">) => void;
  adminUpdateSupportTicket: (ticketId: string, patch: Partial<Pick<SupportLog, "assignedTo" | "assignedToName" | "category" | "priority" | "status">>) => void;
  adminAddSupportNote: (ticketId: string, note: string) => void;
  adminAddSupportCommunication: (ticketId: string, message: string) => void;
  adminProcessSupportCompensation: (ticketId: string, amount: number, reason: string) => void;
  adminDeleteSupportTicket: (ticketId: string) => void;
  adminClearSupportTickets: () => void;
  adminUpdateCancellationPolicy: (patch: Partial<Omit<CancellationPolicy, "id">>) => void;
  adminResolveRefundRequest: (orderId: string, status: "approved" | "rejected", amount: number, note?: string) => void;
  adminClearRefundHistory: () => void;
  adminSetCommissionRate: (rate: number) => void;
  adminUpdatePartnerVerification: (uid: string, status: NonNullable<UserProfile["documentVerification"]>["status"]) => void;
  adminClearActionLogs: () => void;
  ownerShop: Shop | null;
};

const DATA_KEY = "rasoigo:data:v1";
const CART_KEY = "rasoigo:cart:v1";
const LOCAL_SESSION_KEY = "rasoigo:local-session:v1";
const USER_PREFIX = "rasoigo:user:";
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@gmail.com";
const DEFAULT_CANCELLATION_POLICY: CancellationPolicy = {
  id: "default",
  freeCancellationMinutes: 5,
  penaltyPercent: 10,
  maxPenalty: 100,
  requireAdminApproval: true
};

const AppContext = createContext<AppContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function profileFromFirebase(user: User, role: UserRole = "user"): UserProfile {
  return {
    uid: user.uid,
    fullName: user.displayName || user.email?.split("@")[0] || "RasoiGo User",
    email: user.email || "",
    role,
    photoURL: user.photoURL,
    createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).toISOString() : new Date().toISOString()
  };
}

function getSavedProfile(uid: string) {
  return readJson<UserProfile | null>(`${USER_PREFIX}${uid}`, null);
}

function saveProfile(profile: UserProfile) {
  writeJson(`${USER_PREFIX}${profile.uid}`, profile);
}

function isUserRole(value: unknown): value is UserRole {
  return value === "user" || value === "owner" || value === "delivery" || value === "admin";
}

function normalizeCloudUser(value: unknown): UserProfile | null {
  if (!value || typeof value !== "object") return null;

  const user = value as Partial<UserProfile>;
  if (!user.uid || !user.email) return null;

  return withCreatedAt({
    uid: String(user.uid),
    fullName: String(user.fullName || user.email.split("@")[0] || "RasoiGo User"),
    email: String(user.email),
    mobile: user.mobile,
    role: isUserRole(user.role) ? user.role : "user",
    photoURL: user.photoURL,
    suspended: Boolean(user.suspended),
    zone: user.zone,
    documentVerification: user.documentVerification,
    bankDetails: user.bankDetails,
    createdAt: user.createdAt
  });
}

function cloudUserPayload(profile: UserProfile) {
  const safeProfile = withCreatedAt(profile);
  const payload: Record<string, unknown> = {
    uid: safeProfile.uid,
    fullName: safeProfile.fullName,
    email: safeProfile.email,
    role: safeProfile.role,
    createdAt: safeProfile.createdAt || new Date().toISOString()
  };

  if (safeProfile.mobile) payload.mobile = safeProfile.mobile;
  if (safeProfile.photoURL !== undefined) payload.photoURL = safeProfile.photoURL;
  if (safeProfile.suspended !== undefined) payload.suspended = safeProfile.suspended;
  if (safeProfile.zone) payload.zone = safeProfile.zone;
  if (safeProfile.documentVerification) payload.documentVerification = safeProfile.documentVerification;
  if (safeProfile.bankDetails) payload.bankDetails = safeProfile.bankDetails;

  return payload;
}

async function upsertCloudUser(profile: UserProfile) {
  if (profile.uid === "admin-local") return;

  try {
    const [{ doc, setDoc }, firestore] = await Promise.all([
      import("firebase/firestore"),
      getClientFirestore()
    ]);
    await setDoc(doc(firestore, "users", profile.uid), cloudUserPayload(profile), { merge: true });
  } catch {
    // Keep local auth usable when Firestore is not enabled or rules block writes.
  }
}

async function patchCloudUser(uid: string, patch: Partial<UserProfile>) {
  if (uid === "admin-local") return;

  try {
    const [{ doc, updateDoc }, firestore] = await Promise.all([
      import("firebase/firestore"),
      getClientFirestore()
    ]);
    await updateDoc(doc(firestore, "users", uid), patch);
  } catch {
    // Admin actions still update local state if cloud sync is unavailable.
  }
}

async function deleteCloudUser(uid: string) {
  if (uid === "admin-local") return;

  try {
    const [{ deleteDoc, doc }, firestore] = await Promise.all([
      import("firebase/firestore"),
      getClientFirestore()
    ]);
    await deleteDoc(doc(firestore, "users", uid));
  } catch {
    // Local deletion remains available when cloud sync is unavailable.
  }
}

async function deleteCloudDocument(collectionName: string, id: string) {
  try {
    const [{ deleteDoc, doc }, firestore] = await Promise.all([
      import("firebase/firestore"),
      getClientFirestore()
    ]);
    await deleteDoc(doc(firestore, collectionName, id));
  } catch {
    // Local deletion remains available when cloud sync is unavailable.
  }
}

async function upsertCloudDocument(collectionName: string, id: string, value: object) {
  try {
    const [{ doc, setDoc }, firestore] = await Promise.all([
      import("firebase/firestore"),
      getClientFirestore()
    ]);
    await setDoc(doc(firestore, collectionName, id), value, { merge: true });
  } catch {
    // Local updates remain available when cloud sync is unavailable.
  }
}

async function deleteCloudDocumentsByField(collectionName: string, fieldName: string, value: string) {
  try {
    const [{ collection, deleteDoc, getDocs, query, where }, firestore] = await Promise.all([
      import("firebase/firestore"),
      getClientFirestore()
    ]);
    const snapshot = await getDocs(query(collection(firestore, collectionName), where(fieldName, "==", value)));
    await Promise.all(snapshot.docs.map((entry) => deleteDoc(entry.ref)));
  } catch {
    // Local deletion remains available when cloud sync is unavailable.
  }
}

async function clearCloudCollection(collectionName: string) {
  try {
    const [{ collection, deleteDoc, getDocs }, firestore] = await Promise.all([
      import("firebase/firestore"),
      getClientFirestore()
    ]);
    const snapshot = await getDocs(collection(firestore, collectionName));
    await Promise.all(snapshot.docs.map((entry) => deleteDoc(entry.ref)));
  } catch {
    // Local deletion remains available when cloud sync is unavailable.
  }
}

async function clearCloudOrderRefundFields(orderIds: string[]) {
  if (orderIds.length === 0) return;

  try {
    const [{ deleteField, doc, updateDoc }, firestore] = await Promise.all([
      import("firebase/firestore"),
      getClientFirestore()
    ]);
    await Promise.all(orderIds.map((orderId) => updateDoc(doc(firestore, "orders", orderId), {
      cancellationReason: deleteField(),
      cancellationPenalty: deleteField(),
      refundStatus: deleteField(),
      refundAmount: deleteField(),
      refundRequestedAt: deleteField(),
      refundDecisionNote: deleteField()
    })));
  } catch {
    // Local cleanup remains available when cloud sync is unavailable.
  }
}

async function deleteStorageAsset(url?: string | null) {
  if (!url || url.startsWith("/")) return;
  if (!url.startsWith("gs://") && !url.includes("firebasestorage.googleapis.com")) return;

  try {
    const [{ deleteObject, ref }, clientStorage] = await Promise.all([
      import("firebase/storage"),
      getClientStorage()
    ]);
    await deleteObject(ref(clientStorage, url));
  } catch {
    // Keep local deletion usable if the file is already gone or rules block storage deletion.
  }
}

async function deleteUserCloudData(uid: string) {
  await Promise.all([
    deleteCloudUser(uid),
    deleteCloudDocumentsByField("orders", "userId", uid),
    deleteCloudDocumentsByField("wallet", "userId", uid),
    deleteCloudDocumentsByField("refundRecords", "userId", uid),
    deleteCloudDocumentsByField("notifications", "userId", uid),
    deleteCloudDocumentsByField("supportLogs", "userId", uid),
    deleteCloudDocumentsByField("reviews", "userId", uid),
    deleteCloudDocument("addressesByUser", uid),
    deleteCloudDocument("favoritesByUser", uid),
    deleteCloudDocument("recentSearchesByUser", uid)
  ]);
}

function withCreatedAt(profile: UserProfile): UserProfile {
  return {
    ...profile,
    createdAt: profile.createdAt || new Date().toISOString()
  };
}

function mergeSeedData(savedData: RasoiGoData): RasoiGoData {
  const seedShopIds = new Set(seedData.shops.map((shop) => shop.id));
  const seedItemIds = new Set(seedData.items.map((item) => item.id));

  return {
    ...savedData,
    users: [
      ...seedData.users.map(withCreatedAt),
      ...(savedData.users || []).filter((user) => !seedData.users.some((seedUser) => seedUser.uid === user.uid)).map(withCreatedAt)
    ],
    shops: [
      ...seedData.shops,
      ...(savedData.shops || []).filter((shop) => !seedShopIds.has(shop.id))
    ],
    items: [
      ...seedData.items,
      ...(savedData.items || []).filter((item) => !seedItemIds.has(item.id))
    ],
    orders: savedData.orders || [],
    favoritesByUser: savedData.favoritesByUser || {},
    addressesByUser: savedData.addressesByUser || {},
    recentSearchesByUser: savedData.recentSearchesByUser || {},
    coupons: savedData.coupons?.length ? savedData.coupons : seedData.coupons,
    wallet: savedData.wallet || [],
    notifications: savedData.notifications || [],
    reviews: savedData.reviews || [],
    supportLogs: (savedData.supportLogs || []).map(normalizeSupportLog).filter((log) => Boolean(log.userId)),
    cancellationPolicy: normalizeCancellationPolicy(savedData.cancellationPolicy),
    refundRecords: (savedData.refundRecords || []).map(normalizeRefundRecord).filter((record) => Boolean(record.orderId && record.userId)),
    platformSettings: {
      commissionRate: savedData.platformSettings?.commissionRate ?? seedData.platformSettings.commissionRate,
      updatedAt: savedData.platformSettings?.updatedAt,
      updatedBy: savedData.platformSettings?.updatedBy
    },
    adminActionLogs: savedData.adminActionLogs || []
  };
}

function mergeUsers(currentUsers: UserProfile[], cloudUsers: UserProfile[]) {
  const usersById = new Map<string, UserProfile>();

  currentUsers.map(withCreatedAt).forEach((user) => {
    usersById.set(user.uid, user);
  });
  cloudUsers.map(withCreatedAt).forEach((user) => {
    usersById.set(user.uid, user);
  });

  return Array.from(usersById.values()).sort((left, right) => {
    if (left.role === "admin" && right.role !== "admin") return -1;
    if (left.role !== "admin" && right.role === "admin") return 1;
    return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
  });
}

function normalizeSupportLog(log: Partial<SupportLog>): SupportLog {
  return {
    id: log.id || makeId("support"),
    userId: log.userId || "",
    orderId: log.orderId,
    category: log.category || "order",
    subject: log.subject || "Support ticket",
    message: log.message || "",
    priority: log.priority || "medium",
    status: log.status || "open",
    assignedTo: log.assignedTo,
    assignedToName: log.assignedToName,
    communications: log.communications || [],
    internalNotes: log.internalNotes || [],
    resolutionHistory: log.resolutionHistory || [],
    compensation: log.compensation,
    createdAt: log.createdAt || new Date().toISOString()
  };
}

function normalizeCancellationPolicy(policy?: Partial<CancellationPolicy>): CancellationPolicy {
  return {
    ...DEFAULT_CANCELLATION_POLICY,
    ...policy,
    id: "default"
  };
}

function normalizeRefundRecord(record: Partial<RefundRecord>): RefundRecord {
  return {
    id: record.id || makeId("refund"),
    orderId: record.orderId || "",
    userId: record.userId || "",
    amount: Number(record.amount || 0),
    penalty: Number(record.penalty || 0),
    type: record.type || "full",
    status: record.status || "requested",
    reason: record.reason || "Customer cancelled order",
    note: record.note,
    transactionId: record.transactionId,
    createdAt: record.createdAt || new Date().toISOString(),
    processedAt: record.processedAt,
    processedBy: record.processedBy
  };
}

function getCancellationPenalty(order: Order, policy: CancellationPolicy, cancelledAt: string) {
  const elapsedMinutes = Math.max(0, Math.floor((new Date(cancelledAt).getTime() - new Date(order.createdAt).getTime()) / 60000));
  if (elapsedMinutes <= policy.freeCancellationMinutes) return 0;
  return Math.min(policy.maxPenalty, Math.round((order.total * policy.penaltyPercent) / 100));
}

function buildSupportTicket(
  input: Pick<SupportLog, "userId" | "orderId" | "category" | "subject" | "message" | "priority">,
  user: UserProfile | undefined,
  actor: UserProfile
): SupportLog {
  const createdAt = new Date().toISOString();

  return {
    id: makeId("support"),
    userId: input.userId,
    orderId: input.orderId || undefined,
    category: input.category,
    subject: input.subject,
    message: input.message,
    priority: input.priority,
    status: "open",
    communications: [
      {
        id: makeId("communication"),
        fromRole: user?.role || "user",
        fromName: user?.fullName || "Customer",
        message: input.message,
        createdAt
      }
    ],
    internalNotes: [],
    resolutionHistory: [
      {
        id: makeId("resolution"),
        action: "Ticket raised by customer",
        actorId: actor.uid,
        actorName: actor.fullName,
        createdAt
      }
    ],
    createdAt
  };
}

function buildAdminActionLog(profile: UserProfile, action: string, targetType: AdminActionLog["targetType"], targetId?: string): AdminActionLog {
  return {
    id: makeId("admin-action"),
    actorId: profile.uid,
    actorName: profile.fullName,
    action,
    targetType,
    targetId,
    createdAt: new Date().toISOString()
  };
}

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function bestCoupon(total: number, coupons: RasoiGoData["coupons"], manualCode?: string) {
  const activeCoupons = coupons.filter((coupon) => coupon.active && total >= coupon.minOrder);
  if (manualCode) {
    const manual = activeCoupons.find((coupon) => coupon.code.toLowerCase() === manualCode.toLowerCase());
    if (manual) return manual;
  }
  return activeCoupons.sort((left, right) => right.discount - left.discount)[0] || null;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RasoiGoData>(() => mergeSeedData(readJson(DATA_KEY, seedData)));
  const [cart, setCart] = useState<CartItem[]>(() => readJson(CART_KEY, []));

  useEffect(() => {
    let active = true;
    let unsubscribe: Unsubscribe | undefined;

    const analyticsTimer = window.setTimeout(() => {
      initializeFirebaseAnalytics().catch(() => null);
    }, 1500);

    async function listenForAuth() {
      try {
        const [{ onAuthStateChanged }, clientAuth] = await Promise.all([
          import("firebase/auth"),
          getClientAuth()
        ]);

        if (!active) return;

        unsubscribe = onAuthStateChanged(clientAuth, (user) => {
          setFirebaseUser(user);
          if (user) {
            const appData = mergeSeedData(readJson(DATA_KEY, seedData));
            const saved = withCreatedAt(appData.users.find((entry) => entry.uid === user.uid) || getSavedProfile(user.uid) || profileFromFirebase(user));
            if (saved.suspended) {
              setProfile(null);
              setLoading(false);
              return;
            }
            saveProfile(saved);
            void upsertCloudUser(saved);
            setData((current) => ({
              ...current,
              users: current.users.some((entry) => entry.uid === saved.uid)
                ? current.users.map((entry) => (entry.uid === saved.uid ? saved : entry))
                : [saved, ...current.users]
            }));
            setProfile(saved);
          } else {
            const localSession = readJson<UserProfile | null>(LOCAL_SESSION_KEY, null);
            if (localSession) {
              const sessionProfile = withCreatedAt(localSession);
              saveProfile(sessionProfile);
              setProfile(sessionProfile);
            } else {
              setProfile(null);
            }
          }
          setLoading(false);
        });
      } catch {
        if (active) setLoading(false);
      }
    }

    void listenForAuth();

    return () => {
      active = false;
      window.clearTimeout(analyticsTimer);
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    writeJson(DATA_KEY, data);
  }, [data]);

  useEffect(() => {
    writeJson(CART_KEY, cart);
  }, [cart]);

  useEffect(() => {
    if (profile?.role !== "admin") return;

    let active = true;
    const unsubscribes: Unsubscribe[] = [];

    async function subscribeToAdminCloudData() {
      try {
        const [{ collection, onSnapshot }, firestore] = await Promise.all([
          import("firebase/firestore"),
          getClientFirestore()
        ]);

        if (!active) return;

        const unsubscribeUsers = onSnapshot(
          collection(firestore, "users"),
          (snapshot) => {
            const cloudUsers = snapshot.docs
              .map((entry) => normalizeCloudUser({ uid: entry.id, ...entry.data() }))
              .filter((user): user is UserProfile => Boolean(user));

            setData((current) => ({
              ...current,
              users: mergeUsers(current.users, cloudUsers)
            }));
          },
          () => {
            // Keep the admin dashboard usable with locally known users when Firestore rules block reads.
          }
        );
        unsubscribes.push(unsubscribeUsers);
        const unsubscribeSupportLogs = onSnapshot(
          collection(firestore, "supportLogs"),
          (snapshot) => {
            const cloudSupportLogs = snapshot.docs
              .map((entry) => normalizeSupportLog({ id: entry.id, ...entry.data() }))
              .filter((log) => Boolean(log.userId));

            setData((current) => ({
              ...current,
              supportLogs: cloudSupportLogs.length ? cloudSupportLogs : current.supportLogs
            }));
          },
          () => {
            // Keep locally raised ticket data visible if Firestore rules block reads.
          }
        );
        unsubscribes.push(unsubscribeSupportLogs);
      } catch {
        // The admin dashboard still shows locally known data if cloud sync is unavailable.
      }
    }

    void subscribeToAdminCloudData();

    return () => {
      active = false;
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [profile?.role]);

  useEffect(() => {
    const refreshData = () => {
      setData(mergeSeedData(readJson(DATA_KEY, seedData)));
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === DATA_KEY) {
        refreshData();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshData);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshData);
    };
  }, []);

  const ownerShop = useMemo(() => {
    if (!profile) return null;
    return data.shops.find((shop) => shop.ownerId === profile.uid) || null;
  }, [data.shops, profile]);

  const favorites = useMemo(() => {
    if (!profile) return [];
    return data.favoritesByUser[profile.uid] || [];
  }, [data.favoritesByUser, profile]);

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );

  const ensureOwnerShop = useCallback(() => {
    if (!profile) throw new Error("Please sign in first.");
    const existing = data.shops.find((shop) => shop.ownerId === profile.uid);
    if (existing) return existing;

    const shop: Shop = {
      id: makeId("shop"),
      ownerId: profile.uid,
      name: `${profile.fullName}'s Kitchen`,
      city: "Kolkata",
      cuisine: "Fresh Food",
      rating: 4.5,
      deliveryTime: "25-35 min",
      image: "/food/shop.png",
      open: true,
      busy: false,
      openingTime: "10:00",
      closingTime: "23:00"
    };

    setData((current) => ({ ...current, shops: [shop, ...current.shops] }));
    return shop;
  }, [data.shops, profile]);

  const value = useMemo<AppContextValue>(() => ({
    firebaseUser,
    profile,
    loading,
    data,
    cart,
    cartTotal,
    favorites,
    ownerShop,
    signUp: async (input) => {
      const [{ createUserWithEmailAndPassword, updateProfile }, clientAuth] = await Promise.all([
        import("firebase/auth"),
        getClientAuth()
      ]);
      const credential = await createUserWithEmailAndPassword(clientAuth, input.email, input.password);
      await updateProfile(credential.user, { displayName: input.fullName });
      const nextProfile: UserProfile = {
        uid: credential.user.uid,
        fullName: input.fullName,
        email: input.email,
        mobile: input.mobile,
        role: input.role,
        photoURL: credential.user.photoURL,
        createdAt: new Date().toISOString()
      };
      saveProfile(nextProfile);
      setData((current) => ({
        ...current,
        users: current.users.some((entry) => entry.uid === nextProfile.uid)
          ? current.users.map((entry) => (entry.uid === nextProfile.uid ? nextProfile : entry))
          : [nextProfile, ...current.users]
      }));
      setProfile(nextProfile);
      await upsertCloudUser(nextProfile);
    },
    signIn: async (email, password) => {
      if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        const response = await fetch("/api/admin-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Invalid admin credentials.");
        const nextProfile = withCreatedAt(payload.profile as UserProfile);
        writeJson(LOCAL_SESSION_KEY, nextProfile);
        saveProfile(nextProfile);
        setData((current) => ({
          ...current,
          users: current.users.some((entry) => entry.uid === nextProfile.uid)
            ? current.users.map((entry) => (entry.uid === nextProfile.uid ? nextProfile : entry))
            : [nextProfile, ...current.users]
        }));
        setProfile(nextProfile);
        return;
      }
      const [{ signInWithEmailAndPassword }, clientAuth] = await Promise.all([
        import("firebase/auth"),
        getClientAuth()
      ]);
      await signInWithEmailAndPassword(clientAuth, email, password);
    },
    signInWithGoogle: async (role = "user") => {
      const [{ signInWithPopup }, clientAuth, googleProvider] = await Promise.all([
        import("firebase/auth"),
        getClientAuth(),
        createGoogleProvider()
      ]);
      const credential = await signInWithPopup(clientAuth, googleProvider);
      const appData = mergeSeedData(readJson(DATA_KEY, seedData));
      const saved = appData.users.find((entry) => entry.uid === credential.user.uid) || getSavedProfile(credential.user.uid);
      const nextProfile = withCreatedAt(saved || profileFromFirebase(credential.user, role));
      if (nextProfile.suspended) throw new Error("This account is suspended.");
      saveProfile(nextProfile);
      await upsertCloudUser(nextProfile);
      setData((current) => ({
        ...current,
        users: current.users.some((entry) => entry.uid === nextProfile.uid)
          ? current.users.map((entry) => (entry.uid === nextProfile.uid ? nextProfile : entry))
          : [nextProfile, ...current.users]
      }));
      setProfile(nextProfile);
    },
    resetPassword: async (email) => {
      const [{ sendPasswordResetEmail }, clientAuth] = await Promise.all([
        import("firebase/auth"),
        getClientAuth()
      ]);
      await sendPasswordResetEmail(clientAuth, email);
    },
    logout: async () => {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(LOCAL_SESSION_KEY);
        window.sessionStorage.removeItem("rasoigo:login-offer-dismissed");
      }
      const [{ signOut }, clientAuth] = await Promise.all([
        import("firebase/auth"),
        getClientAuth()
      ]);
      await signOut(clientAuth);
      setCart([]);
      setProfile(null);
    },
    updateUserProfile: (patch) => {
      if (!profile) return;
      const nextPatch = profile.role === "admin" ? patch : { ...patch, role: profile.role };
      const nextProfile = { ...profile, ...nextPatch };
      saveProfile(nextProfile);
      void upsertCloudUser(nextProfile);
      if (profile.uid === "admin-local") writeJson(LOCAL_SESSION_KEY, nextProfile);
      setData((current) => ({
        ...current,
        users: current.users.some((entry) => entry.uid === nextProfile.uid)
          ? current.users.map((entry) => (entry.uid === nextProfile.uid ? nextProfile : entry))
          : [nextProfile, ...current.users]
      }));
      setProfile(nextProfile);
    },
    saveAddress: (input) => {
      if (!profile || profile.role !== "user") return;
      const address = { ...input, id: input.id || makeId("address") };
      setData((current) => {
        const existing = current.addressesByUser[profile.uid] || [];
        const nextAddresses = existing.some((entry) => entry.id === address.id)
          ? existing.map((entry) => (entry.id === address.id ? address : entry))
          : [address, ...existing];
        return {
          ...current,
          addressesByUser: {
            ...current.addressesByUser,
            [profile.uid]: nextAddresses.map((entry) => ({
              ...entry,
              default: address.default ? entry.id === address.id : entry.default
            }))
          }
        };
      });
    },
    deleteAddress: (addressId) => {
      if (!profile) return;
      setData((current) => ({
        ...current,
        addressesByUser: {
          ...current.addressesByUser,
          [profile.uid]: (current.addressesByUser[profile.uid] || []).filter((entry) => entry.id !== addressId)
        }
      }));
    },
    recordSearch: (term) => {
      if (!profile || !term.trim()) return;
      const normalized = term.trim();
      setData((current) => {
        const existing = current.recentSearchesByUser[profile.uid] || [];
        return {
          ...current,
          recentSearchesByUser: {
            ...current.recentSearchesByUser,
            [profile.uid]: [normalized, ...existing.filter((entry) => entry.toLowerCase() !== normalized.toLowerCase())].slice(0, 6)
          }
        };
      });
    },
    addToCart: (item, quantity) => {
      if (profile?.role !== "user") return;
      if (quantity < 1) return;
      setCart((current) => {
        const existing = current.find((entry) => entry.id === item.id);
        if (existing) {
          return current.map((entry) =>
            entry.id === item.id
              ? { ...entry, quantity: entry.quantity + quantity }
              : entry
          );
        }
        return [...current, { ...item, quantity }];
      });
    },
    updateCartQuantity: (itemId, quantity) => {
      setCart((current) =>
        quantity <= 0
          ? current.filter((item) => item.id !== itemId)
          : current.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    },
    removeFromCart: (itemId) => {
      setCart((current) => current.filter((item) => item.id !== itemId));
    },
    clearCart: () => {
      setCart([]);
    },
    toggleFavorite: (itemId) => {
      if (!profile || profile.role !== "user") return;
      setData((current) => {
        const currentFavorites = current.favoritesByUser[profile.uid] || [];
        const nextFavorites = currentFavorites.includes(itemId)
          ? currentFavorites.filter((id) => id !== itemId)
          : [...currentFavorites, itemId];
        return {
          ...current,
          favoritesByUser: {
            ...current.favoritesByUser,
            [profile.uid]: nextFavorites
          }
        };
      });
    },
    placeOrder: ({ address, addressId, note, scheduledFor, couponCode, paymentMethod = "cash", razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
      if (!profile) throw new Error("Please sign in before placing an order.");
      if (profile.role !== "user") throw new Error("Only user accounts can place food orders.");
      if (cart.length === 0) throw new Error("Your cart is empty.");
      if (scheduledFor) {
        const scheduledTime = new Date(scheduledFor).getTime();
        const now = Date.now();
        if (scheduledTime < now) throw new Error("Schedule time cannot be in the past.");
        if (scheduledTime > now + 24 * 60 * 60 * 1000) throw new Error("Orders can be scheduled up to 24 hours ahead.");
      }
      const coupon = bestCoupon(cartTotal, data.coupons, couponCode);
      const deliveryFee = cartTotal >= 500 ? 0 : 40;
      const discount = coupon?.discount || 0;
      const packageCount = cart.reduce((total, item) => total + item.quantity, 0);
      const order: Order = {
        id: makeId("order"),
        userId: profile.uid,
        items: cart,
        address,
        addressId,
        note,
        scheduledFor,
        subtotal: cartTotal,
        deliveryFee,
        discount,
        couponCode: coupon?.code,
        total: Math.max(0, cartTotal + deliveryFee - discount),
        status: "pending",
        paymentMethod,
        paymentStatus: paymentMethod === "razorpay" ? "paid" : "pending",
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        createdAt: new Date().toISOString(),
        deliveryOtp: String(Math.floor(1000 + Math.random() * 9000))
      };
      setData((current) => {
        const orderedShopIds = Array.from(new Set(order.items.map((item) => item.shopId)));
        const ownerNotifications = Array.from(
          new Set(
            current.shops
              .filter((shop) => orderedShopIds.includes(shop.id) && shop.ownerId)
              .map((shop) => shop.ownerId as string)
          )
        ).map((ownerId) => ({
          id: makeId("notification"),
          userId: ownerId,
          title: "New kitchen order",
          body: `${profile.fullName} ordered ${packageCount} items. Open Kitchen orders to accept and process it.`,
          createdAt: order.createdAt
        }));
        const deliveryNotifications = current.users
          .filter((user) => user.role === "delivery" && !user.suspended)
          .map((user) => ({
            id: makeId("notification"),
            userId: user.uid,
            title: "New delivery request",
            body: `Order ${order.id.slice(0, 10)} has ${packageCount} items for ${address}. Pick it up after kitchen confirmation.`,
            createdAt: order.createdAt
          }));

        return {
          ...current,
          orders: [order, ...current.orders],
          wallet: [
            {
              id: makeId("wallet"),
              userId: profile.uid,
              amount: -order.total,
              label: `${paymentMethod === "razorpay" ? "Razorpay" : "Cash"} order ${order.id.slice(0, 10)}`,
              createdAt: order.createdAt,
              type: "order"
            },
            ...current.wallet
          ],
          notifications: [
            {
              id: makeId("notification"),
              userId: profile.uid,
              title: paymentMethod === "razorpay" ? "Payment successful" : "Order placed",
              body: coupon ? `${coupon.code} applied. Kitchen will confirm soon.` : "Kitchen will confirm soon.",
              createdAt: order.createdAt
            },
            ...ownerNotifications,
            ...deliveryNotifications,
            ...current.notifications
          ]
        };
      });
      setCart([]);
      return order;
    },
    cancelOrder: (orderId) => {
      if (!profile) return;
      setData((current) => {
        const order = current.orders.find((entry) => entry.id === orderId);
        if (!order || order.userId !== profile.uid || !["pending", "received"].includes(order.status)) return current;
        const now = new Date().toISOString();
        const penalty = getCancellationPenalty(order, current.cancellationPolicy, now);
        const refundAmount = Math.max(0, order.total - penalty);
        const refundStatus = current.cancellationPolicy.requireAdminApproval ? "requested" : "approved";
        const refundRecord: RefundRecord = {
          id: makeId("refund"),
          orderId: order.id,
          userId: profile.uid,
          amount: refundAmount,
          penalty,
          type: refundAmount >= order.total ? "full" : "partial",
          status: refundStatus,
          reason: "Customer cancelled order",
          createdAt: now,
          processedAt: refundStatus === "approved" ? now : undefined,
          processedBy: refundStatus === "approved" ? "Auto policy" : undefined,
          transactionId: refundStatus === "approved" ? makeId("txn") : undefined
        };
        const cancelledOrder: Order = {
          ...order,
          status: "cancelled",
          cancelledAt: now,
          cancellationReason: refundRecord.reason,
          cancellationPenalty: penalty,
          refundStatus,
          refundAmount,
          refundRequestedAt: now
        };
        const walletEntry = refundStatus === "approved"
          ? {
              id: makeId("wallet"),
              userId: profile.uid,
              amount: refundAmount,
              label: `Refund for ${order.id.slice(0, 10)}${penalty ? ` after Rs ${penalty} penalty` : ""}`,
              createdAt: now,
              type: "refund" as const
            }
          : null;
        void Promise.all([
          upsertCloudDocument("orders", cancelledOrder.id, cancelledOrder),
          upsertCloudDocument("refundRecords", refundRecord.id, refundRecord),
          ...(walletEntry ? [upsertCloudDocument("wallet", walletEntry.id, walletEntry)] : [])
        ]);
        return {
          ...current,
          orders: current.orders.map((entry) =>
            entry.id === orderId ? cancelledOrder : entry
          ),
          refundRecords: [refundRecord, ...current.refundRecords],
          wallet: walletEntry ? [walletEntry, ...current.wallet] : current.wallet,
          notifications: [
            {
              id: makeId("notification"),
              userId: profile.uid,
              title: "Order cancelled",
              body: refundStatus === "approved"
                ? `Refund of Rs ${refundAmount} added after Rs ${penalty} cancellation penalty.`
                : `Refund request of Rs ${refundAmount} is waiting for admin approval. Rs ${penalty} penalty calculated.`,
              createdAt: now
            },
            ...current.notifications
          ]
        };
      });
    },
    updateOrderStatus: (orderId, status) => {
      if (!profile || !["owner", "delivery", "admin"].includes(profile.role)) {
        throw new Error("Only restaurant owners and delivery partners can update orders.");
      }
      setData((current) => {
        const order = current.orders.find((entry) => entry.id === orderId);
        const titleByStatus: Partial<Record<OrderStatus, string>> = {
          received: "Restaurant accepted your order",
          preparing: "Food is being prepared",
          "out-for-delivery": "Order is out for delivery",
          delivered: "Order delivered"
        };
        return {
          ...current,
          orders: current.orders.map((entry) =>
            entry.id === orderId ? { ...entry, status } : entry
          ),
          notifications: order && titleByStatus[status]
            ? [
                {
                  id: makeId("notification"),
                  userId: order.userId,
                  title: titleByStatus[status] || "Order updated",
                  body: `Order ${order.id.slice(0, 10)} is now ${status.replaceAll("-", " ")}.`,
                  createdAt: new Date().toISOString()
                },
                ...current.notifications
              ]
            : current.notifications
        };
      });
    },
    addOwnerItem: async (input) => {
      if (!profile) throw new Error("Please sign in first.");
      if (profile.role !== "owner") throw new Error("Only restaurant owners can add menu items.");
      const shop = ensureOwnerShop();
      let image = "/food/image11.jpg";
      if (input.imageFile) {
        const [{ getDownloadURL, ref, uploadBytes }, clientStorage] = await Promise.all([
          import("firebase/storage"),
          getClientStorage()
        ]);
        const imageRef = ref(clientStorage, `rasoigo/items/${profile.uid}/${Date.now()}-${input.imageFile.name}`);
        await uploadBytes(imageRef, input.imageFile);
        image = await getDownloadURL(imageRef);
      }
      const item: MenuItem = {
        id: makeId("item"),
        shopId: shop.id,
        name: input.name,
        category: input.category,
        foodType: input.foodType,
        price: input.price,
        rating: 4.5,
        image,
        description: input.description,
        createdAt: new Date().toISOString(),
        available: input.available ?? true
      };
      setData((current) => ({ ...current, items: [item, ...current.items] }));
    },
    updateOwnerItem: async (input) => {
      if (!profile || profile.role !== "owner" || !input.id) throw new Error("Only restaurant owners can edit menu items.");
      const shop = ensureOwnerShop();
      let nextImage: string | undefined;
      if (input.imageFile) {
        const [{ getDownloadURL, ref, uploadBytes }, clientStorage] = await Promise.all([
          import("firebase/storage"),
          getClientStorage()
        ]);
        const imageRef = ref(clientStorage, `rasoigo/items/${profile.uid}/${Date.now()}-${input.imageFile.name}`);
        await uploadBytes(imageRef, input.imageFile);
        nextImage = await getDownloadURL(imageRef);
      }
      setData((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === input.id && item.shopId === shop.id
            ? {
                ...item,
                name: input.name,
                category: input.category,
                foodType: input.foodType,
                price: input.price,
                description: input.description,
                available: input.available ?? true,
                image: nextImage || item.image
              }
            : item
        )
      }));
    },
    deleteOwnerItem: (itemId) => {
      if (!profile || profile.role !== "owner" || !ownerShop) return;
      setData((current) => ({
        ...current,
        items: current.items.filter((item) => item.id !== itemId || item.shopId !== ownerShop.id)
      }));
    },
    updateOwnerShop: async (input) => {
      if (!profile || profile.role !== "owner") throw new Error("Only restaurant owners can edit shops.");
      const shop = ensureOwnerShop();
      let image = input.image;
      if (input.imageFile) {
        const [{ getDownloadURL, ref, uploadBytes }, clientStorage] = await Promise.all([
          import("firebase/storage"),
          getClientStorage()
        ]);
        const imageRef = ref(clientStorage, `rasoigo/shops/${profile.uid}/${Date.now()}-${input.imageFile.name}`);
        await uploadBytes(imageRef, input.imageFile);
        image = await getDownloadURL(imageRef);
      }
      setData((current) => ({
        ...current,
        shops: current.shops.map((entry) =>
          entry.id === shop.id
            ? {
                ...entry,
                ...input,
                image: image || entry.image
              }
            : entry
        )
      }));
    },
    acceptDeliveryOrder: (orderId) => {
      if (!profile || profile.role !== "delivery") throw new Error("Only delivery partners can accept orders.");
      setData((current) => {
        const targetOrder = current.orders.find((order) => order.id === orderId);
        if (!targetOrder) throw new Error("Order not found.");
        if (["delivered", "cancelled"].includes(targetOrder.status)) {
          throw new Error("This order is no longer available.");
        }
        if (targetOrder.deliveryPartnerId && targetOrder.deliveryPartnerId !== profile.uid) {
          throw new Error("This order is already assigned.");
        }
        const active = current.orders.some((order) =>
          order.deliveryPartnerId === profile.uid && order.status === "out-for-delivery"
        );
        if (active) throw new Error("You already have one active assignment.");
        const now = new Date().toISOString();
        return {
          ...current,
          orders: current.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: "out-for-delivery",
                  deliveryPartnerId: profile.uid,
                  deliveryPartnerName: profile.fullName,
                  deliveryLocation: { lat: 22.5726, lng: 88.3639, updatedAt: now }
                }
              : order
          ),
          notifications: [
            {
              id: makeId("notification"),
              userId: targetOrder.userId,
              title: "Delivery partner assigned",
              body: `${profile.fullName}${profile.mobile ? ` (${profile.mobile})` : ""} accepted your order and shared live delivery details.`,
              createdAt: now
            },
            ...current.notifications
          ]
        };
      });
    },
    updateDeliveryLocation: (orderId) => {
      if (!profile || profile.role !== "delivery") return;
      setData((current) => ({
        ...current,
        orders: current.orders.map((order) => {
          if (order.id !== orderId || order.deliveryPartnerId !== profile.uid) return order;
          const currentLocation = order.deliveryLocation || { lat: 22.5726, lng: 88.3639, updatedAt: new Date().toISOString() };
          return {
            ...order,
            deliveryLocation: {
              lat: Number((currentLocation.lat + 0.004).toFixed(4)),
              lng: Number((currentLocation.lng + 0.003).toFixed(4)),
              updatedAt: new Date().toISOString()
            }
          };
        })
      }));
    },
    markDeliveredWithOtp: (orderId, otp) => {
      if (!profile || profile.role !== "delivery") throw new Error("Only delivery partners can deliver orders.");
      setData((current) => {
        const order = current.orders.find((entry) => entry.id === orderId);
        if (!order || order.deliveryPartnerId !== profile.uid || order.deliveryOtp !== otp.trim()) {
          throw new Error("Invalid delivery OTP.");
        }
        const now = new Date().toISOString();
        return {
          ...current,
          orders: current.orders.map((entry) =>
            entry.id === orderId ? { ...entry, status: "delivered" } : entry
          ),
          wallet: [
            {
              id: makeId("wallet"),
              userId: profile.uid,
              amount: 45,
              label: `Delivery earning ${order.id.slice(0, 10)}`,
              createdAt: now,
              type: "delivery-earning"
            },
            ...current.wallet
          ],
          notifications: [
            {
              id: makeId("notification"),
              userId: order.userId,
              title: "Order delivered",
              body: "Enjoy your meal. You can now rate items and review the restaurant.",
              createdAt: now
            },
            ...current.notifications
          ]
        };
      });
    },
    rateOrderItem: (orderId, itemId, rating) => {
      if (!profile || profile.role !== "user") return;
      setData((current) => ({
        ...current,
        orders: current.orders.map((order) =>
          order.id === orderId && order.userId === profile.uid && order.status === "delivered"
            ? { ...order, itemRatings: { ...(order.itemRatings || {}), [itemId]: rating } }
            : order
        )
      }));
    },
    reviewOrderShop: (orderId, shopId, rating, comment) => {
      if (!profile || profile.role !== "user") return;
      setData((current) => {
        const order = current.orders.find((entry) => entry.id === orderId && entry.userId === profile.uid && entry.status === "delivered");
        if (!order || current.reviews.some((review) => review.orderId === orderId && review.shopId === shopId)) return current;
        const review = {
          id: makeId("review"),
          orderId,
          userId: profile.uid,
          shopId,
          rating,
          comment,
          createdAt: new Date().toISOString()
        };
        return {
          ...current,
          reviews: [review, ...current.reviews],
          orders: current.orders.map((entry) =>
            entry.id === orderId ? { ...entry, reviewIds: [...(entry.reviewIds || []), review.id] } : entry
          )
        };
      });
    },
    createSupportTicket: (input) => {
      if (!profile || profile.role !== "user") return;
      const ticket = buildSupportTicket(
        {
          ...input,
          userId: profile.uid,
          subject: input.subject.trim(),
          message: input.message.trim()
        },
        profile,
        profile
      );
      void upsertCloudDocument("supportLogs", ticket.id, ticket);
      setData((current) => ({ ...current, supportLogs: [ticket, ...current.supportLogs] }));
    },
    adminCreateSupportTicket: (input) => {
      if (profile?.role !== "admin") return;
      const user = data.users.find((entry) => entry.uid === input.userId);
      const ticket = buildSupportTicket(input, user, profile);
      void upsertCloudDocument("supportLogs", ticket.id, ticket);
      setData((current) => ({ ...current, supportLogs: [ticket, ...current.supportLogs] }));
    },
    adminUpdateSupportTicket: (ticketId, patch) => {
      if (profile?.role !== "admin") return;
      const updatedAt = new Date().toISOString();
      setData((current) => {
        let didUpdate = false;
        const supportLogs = current.supportLogs.map((ticket) => {
          if (ticket.id !== ticketId) return ticket;
          const changes = [
            patch.status && patch.status !== ticket.status ? `Status changed to ${patch.status}` : "",
            patch.priority && patch.priority !== ticket.priority ? `Priority changed to ${patch.priority}` : "",
            patch.category && patch.category !== ticket.category ? `Category changed to ${patch.category}` : "",
            patch.assignedTo !== undefined && patch.assignedTo !== ticket.assignedTo ? `Assigned to ${patch.assignedToName || "Unassigned"}` : ""
          ].filter(Boolean);
          didUpdate = true;
          return {
            ...ticket,
            ...patch,
            resolutionHistory: changes.length
              ? [
                  ...changes.map((action) => ({
                    id: makeId("resolution"),
                    action,
                    actorId: profile.uid,
                    actorName: profile.fullName,
                    createdAt: updatedAt
                  })),
                  ...ticket.resolutionHistory
                ]
              : ticket.resolutionHistory
          };
        });
        const ticketToSync = didUpdate ? supportLogs.find((ticket) => ticket.id === ticketId) : null;
        if (ticketToSync) void upsertCloudDocument("supportLogs", ticketToSync.id, ticketToSync);
        return { ...current, supportLogs };
      });
    },
    adminAddSupportNote: (ticketId, note) => {
      if (profile?.role !== "admin" || !note.trim()) return;
      const createdAt = new Date().toISOString();
      setData((current) => {
        let didUpdate = false;
        const supportLogs = current.supportLogs.map((ticket) => {
          if (ticket.id !== ticketId) return ticket;
          didUpdate = true;
          return {
            ...ticket,
            internalNotes: [
              {
                id: makeId("note"),
                note: note.trim(),
                authorId: profile.uid,
                authorName: profile.fullName,
                createdAt
              },
              ...ticket.internalNotes
            ],
            resolutionHistory: [
              {
                id: makeId("resolution"),
                action: "Internal note added",
                actorId: profile.uid,
                actorName: profile.fullName,
                createdAt
              },
              ...ticket.resolutionHistory
            ]
          };
        });
        const ticketToSync = didUpdate ? supportLogs.find((ticket) => ticket.id === ticketId) : null;
        if (ticketToSync) void upsertCloudDocument("supportLogs", ticketToSync.id, ticketToSync);
        return { ...current, supportLogs };
      });
    },
    adminAddSupportCommunication: (ticketId, message) => {
      if (profile?.role !== "admin" || !message.trim()) return;
      const createdAt = new Date().toISOString();
      setData((current) => {
        let didUpdate = false;
        const supportLogs = current.supportLogs.map((ticket) => {
          if (ticket.id !== ticketId) return ticket;
          didUpdate = true;
          const updatedTicket: SupportLog = {
            ...ticket,
            communications: [
              {
                id: makeId("communication"),
                fromRole: "admin" as const,
                fromName: profile.fullName,
                message: message.trim(),
                createdAt
              },
              ...ticket.communications
            ],
            resolutionHistory: [
              {
                id: makeId("resolution"),
                action: "Customer communication added",
                actorId: profile.uid,
                actorName: profile.fullName,
                createdAt
              },
              ...ticket.resolutionHistory
            ]
          };
          return updatedTicket;
        });
        const ticketToSync = didUpdate ? supportLogs.find((ticket) => ticket.id === ticketId) : null;
        if (ticketToSync) void upsertCloudDocument("supportLogs", ticketToSync.id, ticketToSync);
        return { ...current, supportLogs };
      });
    },
    adminProcessSupportCompensation: (ticketId, amount, reason) => {
      if (profile?.role !== "admin" || amount <= 0 || !reason.trim()) return;
      const processedAt = new Date().toISOString();
      setData((current) => {
        const ticket = current.supportLogs.find((entry) => entry.id === ticketId);
        if (!ticket) return current;
        const walletEntry = {
          id: makeId("wallet"),
          userId: ticket.userId,
          amount,
          label: `Support compensation ${ticket.id.slice(0, 10)}`,
          createdAt: processedAt,
          type: "refund" as const
        };
        const supportLogs = current.supportLogs.map((entry) => {
          if (entry.id !== ticketId) return entry;
          const updatedTicket: SupportLog = {
            ...entry,
            status: "resolved",
            compensation: {
              amount,
              reason: reason.trim(),
              processedAt,
              processedBy: profile.fullName
            },
            resolutionHistory: [
              {
                id: makeId("resolution"),
                action: `Compensation processed: Rs ${amount}`,
                actorId: profile.uid,
                actorName: profile.fullName,
                createdAt: processedAt
              },
              ...entry.resolutionHistory
            ]
          };
          void upsertCloudDocument("supportLogs", updatedTicket.id, updatedTicket);
          return updatedTicket;
        });
        void upsertCloudDocument("wallet", walletEntry.id, walletEntry);
        return {
          ...current,
          wallet: [walletEntry, ...current.wallet],
          supportLogs
        };
      });
    },
    adminDeleteSupportTicket: (ticketId) => {
      if (profile?.role !== "admin") return;
      void deleteCloudDocument("supportLogs", ticketId);
      setData((current) => ({
        ...current,
        supportLogs: current.supportLogs.filter((ticket) => ticket.id !== ticketId)
      }));
    },
    adminClearSupportTickets: () => {
      if (profile?.role !== "admin") return;
      void clearCloudCollection("supportLogs");
      setData((current) => ({
        ...current,
        supportLogs: []
      }));
    },
    adminUpdateCancellationPolicy: (patch) => {
      if (profile?.role !== "admin") return;
      const nextPolicy = normalizeCancellationPolicy({
        ...data.cancellationPolicy,
        ...patch,
        updatedAt: new Date().toISOString()
      });
      void upsertCloudDocument("settings", "cancellationPolicy", nextPolicy);
      setData((current) => ({ ...current, cancellationPolicy: nextPolicy }));
    },
    adminResolveRefundRequest: (orderId, status, amount, note) => {
      if (profile?.role !== "admin") return;
      const processedAt = new Date().toISOString();
      setData((current) => {
        const order = current.orders.find((entry) => entry.id === orderId);
        if (!order || order.status !== "cancelled") return current;

        const existingRecord = current.refundRecords.find((record) => record.orderId === orderId);
        if (existingRecord?.status === "approved") return current;

        const requestedAmount = Math.max(0, Math.min(order.total, Math.round(Number(amount) || 0)));
        const penalty = Math.max(0, order.total - requestedAmount);
        const refundRecord: RefundRecord = {
          id: existingRecord?.id || makeId("refund"),
          orderId,
          userId: order.userId,
          amount: status === "approved" ? requestedAmount : existingRecord?.amount || Math.max(0, order.total - (order.cancellationPenalty || 0)),
          penalty: status === "approved" ? penalty : existingRecord?.penalty || order.cancellationPenalty || 0,
          type: status === "approved" && requestedAmount < order.total ? "partial" : "full",
          status,
          reason: existingRecord?.reason || order.cancellationReason || "Customer cancelled order",
          note: note?.trim() || undefined,
          transactionId: status === "approved" ? existingRecord?.transactionId || makeId("txn") : undefined,
          createdAt: existingRecord?.createdAt || order.refundRequestedAt || processedAt,
          processedAt,
          processedBy: profile.fullName
        };
        const updatedOrder: Order = {
          ...order,
          refundStatus: status,
          refundAmount: status === "approved" ? requestedAmount : 0,
          cancellationPenalty: refundRecord.penalty,
          refundDecisionNote: note?.trim() || undefined,
          paymentStatus: status === "approved" ? "refunded" : order.paymentStatus
        };
        const walletEntry = status === "approved"
          ? {
              id: makeId("wallet"),
              userId: order.userId,
              amount: requestedAmount,
              label: `Admin ${refundRecord.type} refund ${order.id.slice(0, 10)}${penalty ? `, Rs ${penalty} penalty` : ""}`,
              createdAt: processedAt,
              type: "refund" as const
            }
          : null;
        const notification = {
          id: makeId("notification"),
          userId: order.userId,
          title: status === "approved" ? "Refund approved" : "Refund rejected",
          body: status === "approved"
            ? `Rs ${requestedAmount} refund processed. Rs ${penalty} cancellation penalty deducted.`
            : note?.trim() || "Your refund request was rejected by admin.",
          createdAt: processedAt
        };
        const refundRecords = existingRecord
          ? current.refundRecords.map((record) => (record.id === existingRecord.id ? refundRecord : record))
          : [refundRecord, ...current.refundRecords];
        const adminLog = buildAdminActionLog(profile, `${status === "approved" ? "Approved" : "Rejected"} refund for order ${orderId.slice(0, 10)}`, "refund", refundRecord.id);

        void Promise.all([
          upsertCloudDocument("orders", updatedOrder.id, updatedOrder),
          upsertCloudDocument("refundRecords", refundRecord.id, refundRecord),
          ...(walletEntry ? [upsertCloudDocument("wallet", walletEntry.id, walletEntry)] : []),
          upsertCloudDocument("notifications", notification.id, notification),
          upsertCloudDocument("adminActionLogs", adminLog.id, adminLog)
        ]);

        return {
          ...current,
          orders: current.orders.map((entry) => (entry.id === orderId ? updatedOrder : entry)),
          refundRecords,
          wallet: walletEntry ? [walletEntry, ...current.wallet] : current.wallet,
          notifications: [notification, ...current.notifications],
          adminActionLogs: [adminLog, ...current.adminActionLogs]
        };
      });
    },
    adminClearRefundHistory: () => {
      if (profile?.role !== "admin") return;
      const orderIds = Array.from(new Set([
        ...data.refundRecords.map((record) => record.orderId),
        ...data.orders
          .filter((order) => order.refundStatus || order.refundAmount !== undefined || order.cancellationPenalty !== undefined || order.refundRequestedAt)
          .map((order) => order.id)
      ]));
      void Promise.all([
        clearCloudCollection("refundRecords"),
        clearCloudOrderRefundFields(orderIds)
      ]);
      setData((current) => ({
        ...current,
        refundRecords: [],
        orders: current.orders.map((order) => {
          if (!orderIds.includes(order.id)) return order;
          const cleanOrder = { ...order };
          delete cleanOrder.cancellationReason;
          delete cleanOrder.cancellationPenalty;
          delete cleanOrder.refundStatus;
          delete cleanOrder.refundAmount;
          delete cleanOrder.refundRequestedAt;
          delete cleanOrder.refundDecisionNote;
          return cleanOrder;
        })
      }));
    },
    adminSetCommissionRate: (rate) => {
      if (profile?.role !== "admin") return;
      const commissionRate = Math.max(0, Math.min(100, Math.round(rate * 100) / 100));
      const nextSettings = {
        ...data.platformSettings,
        commissionRate,
        updatedAt: new Date().toISOString(),
        updatedBy: profile.fullName
      };
      const adminLog = buildAdminActionLog(profile, `Changed commission rate to ${commissionRate}%`, "commission");
      void Promise.all([
        upsertCloudDocument("settings", "platformSettings", nextSettings),
        upsertCloudDocument("adminActionLogs", adminLog.id, adminLog)
      ]);
      setData((current) => ({
        ...current,
        platformSettings: nextSettings,
        adminActionLogs: [adminLog, ...current.adminActionLogs]
      }));
    },
    adminUpdatePartnerVerification: (uid, status) => {
      if (profile?.role !== "admin") return;
      const targetUser = data.users.find((user) => user.uid === uid);
      if (!targetUser || !["owner", "delivery"].includes(targetUser.role)) return;
      const documentVerification = {
        status,
        documentType: targetUser.documentVerification?.documentType || (targetUser.role === "owner" ? "FSSAI / trade license" : "ID and vehicle proof"),
        documentId: targetUser.documentVerification?.documentId || `${targetUser.role.toUpperCase()}-${uid.slice(0, 6)}`,
        reviewedAt: new Date().toISOString(),
        reviewedBy: profile.fullName
      };
      const adminLog = buildAdminActionLog(profile, `${status} ${targetUser.role} documents for ${targetUser.fullName}`, "verification", uid);
      void Promise.all([
        patchCloudUser(uid, { documentVerification, suspended: status === "rejected" }),
        upsertCloudDocument("adminActionLogs", adminLog.id, adminLog)
      ]);
      setData((current) => ({
        ...current,
        users: current.users.map((user) => (user.uid === uid ? { ...user, documentVerification, suspended: status === "rejected" } : user)),
        adminActionLogs: [adminLog, ...current.adminActionLogs]
      }));
    },
    adminClearActionLogs: () => {
      if (profile?.role !== "admin") return;
      void clearCloudCollection("adminActionLogs");
      setData((current) => ({
        ...current,
        adminActionLogs: []
      }));
    },
    clearNotifications: () => {
      if (!profile) return;
      setData((current) => ({
        ...current,
        notifications: current.notifications.filter((entry) => entry.userId !== profile.uid)
      }));
    },
    adminUpdateUserRole: (uid, role) => {
      if (profile?.role !== "admin" || uid === "admin-local") return;
      const targetUser = data.users.find((user) => user.uid === uid);
      const adminLog = buildAdminActionLog(profile, `Changed ${targetUser?.fullName || uid} role to ${role}`, "user", uid);
      void Promise.all([
        patchCloudUser(uid, { role }),
        upsertCloudDocument("adminActionLogs", adminLog.id, adminLog)
      ]);
      setData((current) => ({
        ...current,
        users: current.users.map((user) => (user.uid === uid ? { ...user, role } : user)),
        adminActionLogs: [adminLog, ...current.adminActionLogs]
      }));
    },
    adminToggleUserSuspended: (uid) => {
      if (profile?.role !== "admin" || uid === "admin-local") return;
      const targetUser = data.users.find((user) => user.uid === uid);
      const nextSuspended = !targetUser?.suspended;
      const adminLog = buildAdminActionLog(profile, `${nextSuspended ? "Blocked" : "Unblocked"} ${targetUser?.fullName || uid}`, "user", uid);
      if (targetUser) {
        void Promise.all([
          patchCloudUser(uid, { suspended: nextSuspended }),
          upsertCloudDocument("adminActionLogs", adminLog.id, adminLog)
        ]);
      }
      setData((current) => ({
        ...current,
        users: current.users.map((user) => (user.uid === uid ? { ...user, suspended: !user.suspended } : user)),
        adminActionLogs: targetUser ? [adminLog, ...current.adminActionLogs] : current.adminActionLogs
      }));
    },
    adminDeleteUser: (uid) => {
      if (profile?.role !== "admin" || uid === "admin-local") return;
      const ownedShops = data.shops.filter((shop) => shop.ownerId === uid);
      const ownedShopIds = new Set(ownedShops.map((shop) => shop.id));
      const ownedItems = data.items.filter((item) => ownedShopIds.has(item.shopId));
      void Promise.all([
        deleteUserCloudData(uid),
        deleteCloudDocumentsByField("shops", "ownerId", uid),
        ...ownedShops.map((shop) => deleteStorageAsset(shop.image)),
        ...ownedItems.map((item) => deleteStorageAsset(item.image)),
        ...ownedItems.map((item) => deleteCloudDocument("items", item.id))
      ]);
      setData((current) => ({
        ...current,
        users: current.users.filter((user) => user.uid !== uid),
        orders: current.orders.filter((order) => order.userId !== uid),
        shops: current.shops.filter((shop) => shop.ownerId !== uid),
        items: current.items.filter((item) => !ownedShopIds.has(item.shopId)),
        wallet: current.wallet.filter((entry) => entry.userId !== uid),
        refundRecords: current.refundRecords.filter((entry) => entry.userId !== uid),
        notifications: current.notifications.filter((entry) => entry.userId !== uid),
        supportLogs: current.supportLogs.filter((entry) => entry.userId !== uid),
        addressesByUser: Object.fromEntries(Object.entries(current.addressesByUser).filter(([userId]) => userId !== uid)),
        favoritesByUser: Object.fromEntries(Object.entries(current.favoritesByUser).filter(([userId]) => userId !== uid)),
        recentSearchesByUser: Object.fromEntries(Object.entries(current.recentSearchesByUser).filter(([userId]) => userId !== uid))
      }));
    },
    adminDeleteShop: (shopId) => {
      if (profile?.role !== "admin") return;
      const shop = data.shops.find((entry) => entry.id === shopId);
      const shopItems = data.items.filter((item) => item.shopId === shopId);
      void Promise.all([
        deleteCloudDocument("shops", shopId),
        deleteCloudDocumentsByField("items", "shopId", shopId),
        deleteStorageAsset(shop?.image),
        ...shopItems.map((item) => deleteStorageAsset(item.image))
      ]);
      setData((current) => ({
        ...current,
        shops: current.shops.filter((shop) => shop.id !== shopId),
        items: current.items.filter((item) => item.shopId !== shopId)
      }));
    },
    adminDeleteItem: (itemId) => {
      if (profile?.role !== "admin") return;
      const item = data.items.find((entry) => entry.id === itemId);
      void Promise.all([
        deleteCloudDocument("items", itemId),
        deleteStorageAsset(item?.image)
      ]);
      setData((current) => ({ ...current, items: current.items.filter((item) => item.id !== itemId) }));
    },
    adminDeleteOrder: (orderId) => {
      if (profile?.role !== "admin") return;
      const relatedRefunds = data.refundRecords.filter((record) => record.orderId === orderId);
      void Promise.all([
        deleteCloudDocument("orders", orderId),
        ...relatedRefunds.map((record) => deleteCloudDocument("refundRecords", record.id))
      ]);
      setData((current) => ({
        ...current,
        orders: current.orders.filter((order) => order.id !== orderId),
        refundRecords: current.refundRecords.filter((record) => record.orderId !== orderId)
      }));
    },
    adminClearActivity: () => {
      if (profile?.role !== "admin") return;
      void Promise.all([
        clearCloudCollection("wallet"),
        clearCloudCollection("refundRecords"),
        clearCloudCollection("notifications"),
        clearCloudCollection("supportLogs")
      ]);
      setData((current) => ({
        ...current,
        wallet: [],
        refundRecords: [],
        notifications: [],
        supportLogs: []
      }));
    },
    adminClearNonAdmins: () => {
      if (profile?.role !== "admin") return;
      const nonAdminUsers = data.users.filter((user) => user.role !== "admin");
      const nonAdminUserIds = new Set(nonAdminUsers.map((user) => user.uid));
      const nonAdminShops = data.shops.filter((shop) => shop.ownerId && nonAdminUserIds.has(shop.ownerId));
      const nonAdminShopIds = new Set(nonAdminShops.map((shop) => shop.id));
      const nonAdminItems = data.items.filter((item) => nonAdminShopIds.has(item.shopId));
      void Promise.all([
        ...nonAdminUsers.map((user) => deleteUserCloudData(user.uid)),
        ...nonAdminShops.map((shop) => deleteCloudDocument("shops", shop.id)),
        ...nonAdminItems.map((item) => deleteCloudDocument("items", item.id)),
        ...nonAdminShops.map((shop) => deleteStorageAsset(shop.image)),
        ...nonAdminItems.map((item) => deleteStorageAsset(item.image)),
        clearCloudCollection("orders"),
        clearCloudCollection("wallet"),
        clearCloudCollection("refundRecords"),
        clearCloudCollection("notifications"),
        clearCloudCollection("reviews"),
        clearCloudCollection("supportLogs")
      ]);
      setData((current) => ({
        ...current,
        users: current.users.filter((user) => user.role === "admin"),
        shops: current.shops.filter((shop) => !shop.ownerId || !nonAdminUserIds.has(shop.ownerId)),
        items: current.items.filter((item) => !nonAdminShopIds.has(item.shopId)),
        orders: [],
        wallet: [],
        refundRecords: [],
        notifications: [],
        reviews: [],
        supportLogs: [],
        addressesByUser: {},
        recentSearchesByUser: {},
        favoritesByUser: {}
      }));
    }
  }), [
    cart,
    cartTotal,
    data,
    ensureOwnerShop,
    favorites,
    firebaseUser,
    loading,
    ownerShop,
    profile
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useRasoiGo() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useRasoiGo must be used within AppProvider");
  return context;
}
