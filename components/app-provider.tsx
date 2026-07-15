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
  RasoiGoData,
  MenuItem,
  Order,
  OrderStatus,
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
  adminUpdateUserRole: (uid: string, role: UserRole) => void;
  adminToggleUserSuspended: (uid: string) => void;
  adminDeleteUser: (uid: string) => void;
  adminDeleteShop: (shopId: string) => void;
  adminDeleteItem: (itemId: string) => void;
  adminDeleteOrder: (orderId: string) => void;
  adminClearNonAdmins: () => void;
  ownerShop: Shop | null;
};

const DATA_KEY = "rasoigo:data:v1";
const CART_KEY = "rasoigo:cart:v1";
const LOCAL_SESSION_KEY = "rasoigo:local-session:v1";
const USER_PREFIX = "rasoigo:user:";
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@gmail.com";

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
    reviews: savedData.reviews || []
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
    initializeFirebaseAnalytics().catch(() => null);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
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
      const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);
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
      await signInWithEmailAndPassword(auth, email, password);
    },
    signInWithGoogle: async (role = "user") => {
      const credential = await signInWithPopup(auth, googleProvider);
      const appData = mergeSeedData(readJson(DATA_KEY, seedData));
      const saved = appData.users.find((entry) => entry.uid === credential.user.uid) || getSavedProfile(credential.user.uid);
      const nextProfile = withCreatedAt(saved || profileFromFirebase(credential.user, role));
      if (nextProfile.suspended) throw new Error("This account is suspended.");
      saveProfile(nextProfile);
      setData((current) => ({
        ...current,
        users: current.users.some((entry) => entry.uid === nextProfile.uid)
          ? current.users.map((entry) => (entry.uid === nextProfile.uid ? nextProfile : entry))
          : [nextProfile, ...current.users]
      }));
      setProfile(nextProfile);
    },
    resetPassword: async (email) => {
      await sendPasswordResetEmail(auth, email);
    },
    logout: async () => {
      if (typeof window !== "undefined") window.localStorage.removeItem(LOCAL_SESSION_KEY);
      await signOut(auth);
      setCart([]);
      setProfile(null);
    },
    updateUserProfile: (patch) => {
      if (!profile) return;
      const nextPatch = profile.role === "admin" ? patch : { ...patch, role: profile.role };
      const nextProfile = { ...profile, ...nextPatch };
      saveProfile(nextProfile);
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
      setData((current) => ({
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
          ...current.notifications
        ]
      }));
      setCart([]);
      return order;
    },
    cancelOrder: (orderId) => {
      if (!profile) return;
      setData((current) => {
        const order = current.orders.find((entry) => entry.id === orderId);
        if (!order || order.userId !== profile.uid || !["pending", "received"].includes(order.status)) return current;
        const now = new Date().toISOString();
        return {
          ...current,
          orders: current.orders.map((entry) =>
            entry.id === orderId ? { ...entry, status: "cancelled", cancelledAt: now } : entry
          ),
          wallet: [
            {
              id: makeId("wallet"),
              userId: profile.uid,
              amount: order.total,
              label: `Refund for ${order.id.slice(0, 10)}`,
              createdAt: now,
              type: "refund"
            },
            ...current.wallet
          ],
          notifications: [
            {
              id: makeId("notification"),
              userId: profile.uid,
              title: "Order cancelled",
              body: `Refund of Rs ${order.total} added to wallet activity.`,
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
        const imageRef = ref(storage, `rasoigo/items/${profile.uid}/${Date.now()}-${input.imageFile.name}`);
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
        const imageRef = ref(storage, `rasoigo/items/${profile.uid}/${Date.now()}-${input.imageFile.name}`);
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
        const imageRef = ref(storage, `rasoigo/shops/${profile.uid}/${Date.now()}-${input.imageFile.name}`);
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
          )
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
    adminUpdateUserRole: (uid, role) => {
      if (profile?.role !== "admin" || uid === "admin-local") return;
      setData((current) => ({
        ...current,
        users: current.users.map((user) => (user.uid === uid ? { ...user, role } : user))
      }));
    },
    adminToggleUserSuspended: (uid) => {
      if (profile?.role !== "admin" || uid === "admin-local") return;
      setData((current) => ({
        ...current,
        users: current.users.map((user) => (user.uid === uid ? { ...user, suspended: !user.suspended } : user))
      }));
    },
    adminDeleteUser: (uid) => {
      if (profile?.role !== "admin" || uid === "admin-local") return;
      setData((current) => ({
        ...current,
        users: current.users.filter((user) => user.uid !== uid),
        orders: current.orders.filter((order) => order.userId !== uid),
        wallet: current.wallet.filter((entry) => entry.userId !== uid),
        notifications: current.notifications.filter((entry) => entry.userId !== uid)
      }));
    },
    adminDeleteShop: (shopId) => {
      if (profile?.role !== "admin") return;
      setData((current) => ({
        ...current,
        shops: current.shops.filter((shop) => shop.id !== shopId),
        items: current.items.filter((item) => item.shopId !== shopId)
      }));
    },
    adminDeleteItem: (itemId) => {
      if (profile?.role !== "admin") return;
      setData((current) => ({ ...current, items: current.items.filter((item) => item.id !== itemId) }));
    },
    adminDeleteOrder: (orderId) => {
      if (profile?.role !== "admin") return;
      setData((current) => ({ ...current, orders: current.orders.filter((order) => order.id !== orderId) }));
    },
    adminClearNonAdmins: () => {
      if (profile?.role !== "admin") return;
      setData((current) => ({
        ...current,
        users: current.users.filter((user) => user.role === "admin"),
        orders: [],
        wallet: [],
        notifications: [],
        reviews: [],
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
