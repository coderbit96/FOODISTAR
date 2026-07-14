"use client";

import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { auth, googleProvider, initializeFirebaseAnalytics, storage } from "@/lib/firebase";
import { seedData } from "@/lib/catalog";
import type {
  CartItem,
  FoodistarData,
  MenuItem,
  Order,
  Shop,
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
  name: string;
  category: string;
  foodType: "veg" | "non veg";
  price: number;
  description: string;
  imageFile?: File | null;
};

type AppContextValue = {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  data: FoodistarData;
  cart: CartItem[];
  cartTotal: number;
  favorites: string[];
  signUp: (input: AuthInput) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (role?: UserRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (patch: Partial<Omit<UserProfile, "uid" | "email">>) => void;
  addToCart: (item: MenuItem, quantity: number) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  toggleFavorite: (itemId: string) => void;
  placeOrder: (input: { address: string; note?: string; scheduledFor?: string }) => Order;
  addOwnerItem: (input: AddItemInput) => Promise<void>;
  ownerShop: Shop | null;
};

const DATA_KEY = "foodistar:data:v1";
const CART_KEY = "foodistar:cart:v1";
const USER_PREFIX = "foodistar:user:";

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
    fullName: user.displayName || user.email?.split("@")[0] || "Foodistar User",
    email: user.email || "",
    role,
    photoURL: user.photoURL
  };
}

function getSavedProfile(uid: string) {
  return readJson<UserProfile | null>(`${USER_PREFIX}${uid}`, null);
}

function saveProfile(profile: UserProfile) {
  writeJson(`${USER_PREFIX}${profile.uid}`, profile);
}

function mergeSeedData(savedData: FoodistarData): FoodistarData {
  const seedShopIds = new Set(seedData.shops.map((shop) => shop.id));
  const seedItemIds = new Set(seedData.items.map((item) => item.id));

  return {
    ...savedData,
    shops: [
      ...seedData.shops,
      ...savedData.shops.filter((shop) => !seedShopIds.has(shop.id))
    ],
    items: [
      ...seedData.items,
      ...savedData.items.filter((item) => !seedItemIds.has(item.id))
    ],
    orders: savedData.orders || [],
    favoritesByUser: savedData.favoritesByUser || {}
  };
}

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FoodistarData>(() => mergeSeedData(readJson(DATA_KEY, seedData)));
  const [cart, setCart] = useState<CartItem[]>(() => readJson(CART_KEY, []));

  useEffect(() => {
    initializeFirebaseAnalytics().catch(() => null);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        const saved = getSavedProfile(user.uid) || profileFromFirebase(user);
        saveProfile(saved);
        setProfile(saved);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    writeJson(DATA_KEY, data);
  }, [data]);

  useEffect(() => {
    writeJson(CART_KEY, cart);
  }, [cart]);

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
      open: true
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
      const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);
      await updateProfile(credential.user, { displayName: input.fullName });
      const nextProfile: UserProfile = {
        uid: credential.user.uid,
        fullName: input.fullName,
        email: input.email,
        mobile: input.mobile,
        role: input.role,
        photoURL: credential.user.photoURL
      };
      saveProfile(nextProfile);
      setProfile(nextProfile);
    },
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    signInWithGoogle: async (role = "user") => {
      const credential = await signInWithPopup(auth, googleProvider);
      const saved = getSavedProfile(credential.user.uid);
      const nextProfile = saved || profileFromFirebase(credential.user, role);
      saveProfile(nextProfile);
      setProfile(nextProfile);
    },
    resetPassword: async (email) => {
      await sendPasswordResetEmail(auth, email);
    },
    logout: async () => {
      await signOut(auth);
      setCart([]);
    },
    updateUserProfile: (patch) => {
      if (!profile) return;
      const nextProfile = { ...profile, ...patch };
      saveProfile(nextProfile);
      setProfile(nextProfile);
    },
    addToCart: (item, quantity) => {
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
      if (!profile) return;
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
    placeOrder: ({ address, note, scheduledFor }) => {
      if (!profile) throw new Error("Please sign in before placing an order.");
      if (cart.length === 0) throw new Error("Your cart is empty.");
      const order: Order = {
        id: makeId("order"),
        userId: profile.uid,
        items: cart,
        address,
        note,
        scheduledFor,
        total: cartTotal + (cartTotal >= 500 ? 0 : 40),
        status: "received",
        paymentMethod: "cash",
        createdAt: new Date().toISOString()
      };
      setData((current) => ({ ...current, orders: [order, ...current.orders] }));
      setCart([]);
      return order;
    },
    addOwnerItem: async (input) => {
      if (!profile) throw new Error("Please sign in first.");
      const shop = ensureOwnerShop();
      let image = "/food/image11.jpg";
      if (input.imageFile) {
        const imageRef = ref(storage, `foodistar/items/${profile.uid}/${Date.now()}-${input.imageFile.name}`);
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
        createdAt: new Date().toISOString()
      };
      setData((current) => ({ ...current, items: [item, ...current.items] }));
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

export function useFoodistar() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useFoodistar must be used within AppProvider");
  return context;
}
