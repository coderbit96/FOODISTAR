export type UserRole = "user" | "owner" | "delivery" | "admin";

export type UserProfile = {
  uid: string;
  fullName: string;
  email: string;
  mobile?: string;
  role: UserRole;
  photoURL?: string | null;
  suspended?: boolean;
  zone?: string;
  documentVerification?: {
    status: "pending" | "verified" | "rejected";
    documentType?: string;
    documentId?: string;
    reviewedAt?: string;
    reviewedBy?: string;
  };
  bankDetails?: {
    accountHolder: string;
    bankName: string;
    accountLast4: string;
    upiId?: string;
  };
  createdAt?: string;
};

export type Shop = {
  id: string;
  ownerId?: string;
  name: string;
  city: string;
  zone?: string;
  branchName?: string;
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

export type GeoPoint = {
  lat: number;
  lng: number;
  accuracy?: number;
};

export type DeliveryAddress = {
  id: string;
  label: string;
  line1: string;
  city: string;
  landmark?: string;
  location?: GeoPoint;
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

export type CancellationPolicy = {
  id: "default";
  freeCancellationMinutes: number;
  penaltyPercent: number;
  maxPenalty: number;
  requireAdminApproval: boolean;
  updatedAt?: string;
};

export type RefundRecord = {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  penalty: number;
  type: "full" | "partial";
  status: "requested" | "approved" | "rejected";
  reason: string;
  note?: string;
  transactionId?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
};

export type PlatformSettings = {
  commissionRate: number;
  updatedAt?: string;
  updatedBy?: string;
};

export type AdminActionLog = {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: "user" | "shop" | "item" | "order" | "refund" | "commission" | "verification" | "support" | "system";
  targetId?: string;
  createdAt: string;
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

export type SupportLog = {
  id: string;
  userId: string;
  orderId?: string;
  category: "order" | "payment" | "delivery";
  subject: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "pending" | "resolved";
  assignedTo?: string;
  assignedToName?: string;
  communications: {
    id: string;
    fromRole: UserRole;
    fromName: string;
    message: string;
    createdAt: string;
  }[];
  internalNotes: {
    id: string;
    note: string;
    createdAt: string;
    authorId: string;
    authorName: string;
  }[];
  resolutionHistory: {
    id: string;
    action: string;
    createdAt: string;
    actorId: string;
    actorName: string;
  }[];
  compensation?: {
    amount: number;
    reason: string;
    processedAt: string;
    processedBy: string;
  };
  createdAt: string;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  address: string;
  addressId?: string;
  customerLocation?: GeoPoint;
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
  cancellationReason?: string;
  cancellationPenalty?: number;
  refundStatus?: RefundRecord["status"];
  refundAmount?: number;
  refundRequestedAt?: string;
  refundDecisionNote?: string;
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
  supportLogs: SupportLog[];
  cancellationPolicy: CancellationPolicy;
  refundRecords: RefundRecord[];
  platformSettings: PlatformSettings;
  adminActionLogs: AdminActionLog[];
};
