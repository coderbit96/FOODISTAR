export type UserRole = "user" | "owner" | "delivery" | "admin";

export type UserProfile = {
  uid: string;
  fullName: string;
  email: string;
  mobile?: string;
  role: UserRole;
  photoURL?: string | null;
  suspended?: boolean;
  createdAt?: string;
};

export type Shop = {
  id: string;
  ownerId?: string;
  name: string;
  city: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  image: string;
  open: boolean;
  busy?: boolean;
  openingTime?: string;
  closingTime?: string;
};

export type FoodType = "veg" | "non veg";

export type MenuItem = {
  id: string;
  shopId: string;
  name: string;
  category: string;
  foodType: FoodType;
  price: number;
  rating: number;
  image: string;
  description: string;
  createdAt: string;
  available?: boolean;
};

export type CartItem = MenuItem & {
  quantity: number;
};

export type OrderStatus = "pending" | "received" | "preparing" | "out-for-delivery" | "delivered" | "cancelled";

export type DeliveryAddress = {
  id: string;
  label: string;
  line1: string;
  city: string;
  landmark?: string;
  default?: boolean;
};

export type Coupon = {
  code: string;
  label: string;
  minOrder: number;
  discount: number;
  active: boolean;
};

export type WalletEntry = {
  id: string;
  userId: string;
  amount: number;
  label: string;
  createdAt: string;
  type: "refund" | "order" | "delivery-earning";
};

export type NotificationEntry = {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  read?: boolean;
};

export type Review = {
  id: string;
  orderId: string;
  userId: string;
  shopId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  address: string;
  addressId?: string;
  note?: string;
  scheduledFor?: string;
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  paymentMethod: "cash" | "razorpay";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryOtp?: string;
  deliveryLocation?: { lat: number; lng: number; updatedAt: string };
  cancelledAt?: string;
  itemRatings?: Record<string, number>;
  reviewIds?: string[];
};

export type RasoiGoData = {
  users: UserProfile[];
  shops: Shop[];
  items: MenuItem[];
  orders: Order[];
  favoritesByUser: Record<string, string[]>;
  addressesByUser: Record<string, DeliveryAddress[]>;
  recentSearchesByUser: Record<string, string[]>;
  coupons: Coupon[];
  wallet: WalletEntry[];
  notifications: NotificationEntry[];
  reviews: Review[];
};
