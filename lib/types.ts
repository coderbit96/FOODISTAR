export type UserRole = "user" | "owner" | "delivery";

export type UserProfile = {
  uid: string;
  fullName: string;
  email: string;
  mobile?: string;
  role: UserRole;
  photoURL?: string | null;
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
};

export type CartItem = MenuItem & {
  quantity: number;
};

export type OrderStatus = "received" | "preparing" | "out-for-delivery" | "delivered";

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  address: string;
  note?: string;
  scheduledFor?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  paymentMethod: "cash";
};

export type FoodistarData = {
  shops: Shop[];
  items: MenuItem[];
  orders: Order[];
  favoritesByUser: Record<string, string[]>;
};
