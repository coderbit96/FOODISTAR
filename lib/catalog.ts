import type { FoodistarData, MenuItem, Shop } from "@/lib/types";

const dishImage = (query: string) =>
  `/api/food-image?name=${encodeURIComponent(query)}`;

export const categories = [
  "All",
  "Snacks",
  "Main Course",
  "Desserts",
  "Pizza",
  "Burgers",
  "Bengali",
  "Sandwiches",
  "South Indian",
  "North Indian",
  "Chinese",
  "Fast Food",
  "Tea Break"
];

export const categoryImages: Record<string, string> = {
  Snacks: "/food/image1.jpg",
  "Main Course": "/food/image2.webp",
  Desserts: "/food/image3.jpg",
  Pizza: "/food/image4.avif",
  Burgers: "/food/image5.jpg",
  Bengali: "/food/image2.webp",
  Sandwiches: "/food/image6.jpg",
  "South Indian": "/food/image7.jpg",
  "North Indian": "/food/image8.avif",
  Chinese: "/food/image9.jpg",
  "Fast Food": "/food/image10.avif",
  "Tea Break": "/food/image1.jpg",
  All: "/food/image11.jpg"
};

export const seedShops: Shop[] = [
  {
    id: "shop-spice-square",
    name: "Spice Square",
    city: "Kolkata",
    cuisine: "North Indian",
    rating: 4.7,
    deliveryTime: "25-30 min",
    image: "/food/shop.png",
    open: true
  },
  {
    id: "shop-urban-bites",
    name: "Urban Bites",
    city: "Kolkata",
    cuisine: "Burgers and Pizza",
    rating: 4.5,
    deliveryTime: "20-25 min",
    image: "/food/image5.jpg",
    open: true
  },
  {
    id: "shop-chai-corner",
    name: "Chai Corner",
    city: "Kolkata",
    cuisine: "Tea Break",
    rating: 4.6,
    deliveryTime: "15-20 min",
    image: "/food/image1.jpg",
    open: true
  },
  {
    id: "shop-bangla-bhoj",
    name: "Bangla Bhoj",
    city: "Kolkata",
    cuisine: "Bengali Classics",
    rating: 4.8,
    deliveryTime: "30-35 min",
    image: "/food/image2.webp",
    open: true
  },
  {
    id: "shop-fast-lane",
    name: "Fast Lane Cafe",
    city: "Kolkata",
    cuisine: "Fast Food",
    rating: 4.5,
    deliveryTime: "18-24 min",
    image: "/food/image10.avif",
    open: true
  }
];

export const seedItems: MenuItem[] = [
  {
    id: "item-paneer-butter",
    shopId: "shop-spice-square",
    name: "Paneer Butter Masala",
    category: "North Indian",
    foodType: "veg",
    price: 249,
    rating: 4.8,
    image: dishImage("paneer butter masala indian curry"),
    description: "Creamy tomato gravy, soft paneer, and warm spices.",
    createdAt: new Date("2026-07-01").toISOString()
  },
  {
    id: "item-biryani",
    shopId: "shop-spice-square",
    name: "Kolkata Chicken Biryani",
    category: "Main Course",
    foodType: "non veg",
    price: 299,
    rating: 4.9,
    image: dishImage("kolkata chicken biryani"),
    description: "Aromatic rice, tender chicken, potato, and balanced masala.",
    createdAt: new Date("2026-07-02").toISOString()
  },
  {
    id: "item-margherita",
    shopId: "shop-urban-bites",
    name: "Classic Margherita Pizza",
    category: "Pizza",
    foodType: "veg",
    price: 229,
    rating: 4.5,
    image: dishImage("margherita pizza"),
    description: "Mozzarella, basil, tomato sauce, and a crisp crust.",
    createdAt: new Date("2026-07-03").toISOString()
  },
  {
    id: "item-cheese-burger",
    shopId: "shop-urban-bites",
    name: "Smoky Cheese Burger",
    category: "Burgers",
    foodType: "non veg",
    price: 189,
    rating: 4.4,
    image: dishImage("cheese burger"),
    description: "Juicy patty, smoked cheese, pickles, and house sauce.",
    createdAt: new Date("2026-07-04").toISOString()
  },
  {
    id: "item-masala-dosa",
    shopId: "shop-spice-square",
    name: "Masala Dosa",
    category: "South Indian",
    foodType: "veg",
    price: 149,
    rating: 4.6,
    image: dishImage("masala dosa"),
    description: "Crisp dosa with spiced potato, sambar, and chutney.",
    createdAt: new Date("2026-07-05").toISOString()
  },
  {
    id: "item-chai-samosa",
    shopId: "shop-chai-corner",
    name: "Adrak Chai and Samosa",
    category: "Tea Break",
    foodType: "veg",
    price: 89,
    rating: 4.7,
    image: dishImage("samosa chai"),
    description: "Strong ginger tea paired with flaky potato samosa.",
    createdAt: new Date("2026-07-06").toISOString()
  },
  {
    id: "item-shorshe-ilish",
    shopId: "shop-bangla-bhoj",
    name: "Shorshe Ilish",
    category: "Bengali",
    foodType: "non veg",
    price: 389,
    rating: 4.9,
    image: dishImage("shorshe ilish bengali fish curry"),
    description: "Hilsa cooked in sharp mustard gravy with green chilli aroma.",
    createdAt: new Date("2026-07-07").toISOString()
  },
  {
    id: "item-kosha-mangsho",
    shopId: "shop-bangla-bhoj",
    name: "Kosha Mangsho",
    category: "Bengali",
    foodType: "non veg",
    price: 349,
    rating: 4.8,
    image: dishImage("kosha mangsho mutton curry"),
    description: "Slow-cooked mutton in rich dark Bengali spices and ghee.",
    createdAt: new Date("2026-07-08").toISOString()
  },
  {
    id: "item-chingri-malai",
    shopId: "shop-bangla-bhoj",
    name: "Chingri Malai Curry",
    category: "Bengali",
    foodType: "non veg",
    price: 329,
    rating: 4.8,
    image: dishImage("chingri malai curry prawn"),
    description: "Prawns simmered in creamy coconut milk, garam masala, and mustard oil.",
    createdAt: new Date("2026-07-09").toISOString()
  },
  {
    id: "item-aloo-posto",
    shopId: "shop-bangla-bhoj",
    name: "Aloo Posto",
    category: "Bengali",
    foodType: "veg",
    price: 149,
    rating: 4.6,
    image: dishImage("aloo posto bengali potato poppy seed"),
    description: "Potatoes tossed in poppy seed paste with green chillies.",
    createdAt: new Date("2026-07-10").toISOString()
  },
  {
    id: "item-luchi-alur-dom",
    shopId: "shop-bangla-bhoj",
    name: "Luchi with Alur Dom",
    category: "Bengali",
    foodType: "veg",
    price: 139,
    rating: 4.7,
    image: dishImage("luchi alur dom bengali"),
    description: "Soft fried luchis served with spicy Bengali potato curry.",
    createdAt: new Date("2026-07-11").toISOString()
  },
  {
    id: "item-basanti-pulao",
    shopId: "shop-bangla-bhoj",
    name: "Basanti Pulao",
    category: "Bengali",
    foodType: "veg",
    price: 179,
    rating: 4.6,
    image: dishImage("basanti pulao bengali rice"),
    description: "Sweet yellow pulao with ghee, cashews, raisins, and aromatic rice.",
    createdAt: new Date("2026-07-12").toISOString()
  },
  {
    id: "item-fish-fry",
    shopId: "shop-bangla-bhoj",
    name: "Kolkata Fish Fry",
    category: "Snacks",
    foodType: "non veg",
    price: 169,
    rating: 4.7,
    image: dishImage("kolkata fish fry"),
    description: "Bhetki-style fillet crumb-fried until crisp with kasundi dip.",
    createdAt: new Date("2026-07-13").toISOString()
  },
  {
    id: "item-mishti-doi",
    shopId: "shop-bangla-bhoj",
    name: "Mishti Doi",
    category: "Desserts",
    foodType: "veg",
    price: 79,
    rating: 4.8,
    image: dishImage("mishti doi bengali dessert"),
    description: "Caramel-toned sweet yogurt set thick and served chilled.",
    createdAt: new Date("2026-07-14").toISOString()
  },
  {
    id: "item-rosogolla",
    shopId: "shop-bangla-bhoj",
    name: "Soft Rosogolla",
    category: "Desserts",
    foodType: "veg",
    price: 69,
    rating: 4.7,
    image: dishImage("rosogolla bengali sweet"),
    description: "Spongy chhena sweets soaked in light cardamom sugar syrup.",
    createdAt: new Date("2026-07-15").toISOString()
  },
  {
    id: "item-kolkata-egg-roll",
    shopId: "shop-fast-lane",
    name: "Kolkata Egg Chicken Roll",
    category: "Fast Food",
    foodType: "non veg",
    price: 129,
    rating: 4.8,
    image: dishImage("kolkata egg chicken roll"),
    description: "Flaky paratha wrapped with egg, chicken, onions, chilli, and sauces.",
    createdAt: new Date("2026-07-16").toISOString()
  },
  {
    id: "item-mughlai-paratha",
    shopId: "shop-fast-lane",
    name: "Mughlai Paratha",
    category: "Fast Food",
    foodType: "non veg",
    price: 159,
    rating: 4.6,
    image: dishImage("mughlai paratha"),
    description: "Stuffed fried paratha with minced filling, egg, salad, and kasundi.",
    createdAt: new Date("2026-07-17").toISOString()
  },
  {
    id: "item-chicken-momos",
    shopId: "shop-fast-lane",
    name: "Steamed Chicken Momos",
    category: "Fast Food",
    foodType: "non veg",
    price: 139,
    rating: 4.5,
    image: dishImage("chicken momos"),
    description: "Juicy dumplings served with spicy red chutney and clear soup.",
    createdAt: new Date("2026-07-18").toISOString()
  },
  {
    id: "item-veg-hakka-noodles",
    shopId: "shop-fast-lane",
    name: "Veg Hakka Noodles",
    category: "Chinese",
    foodType: "veg",
    price: 149,
    rating: 4.4,
    image: dishImage("veg hakka noodles"),
    description: "Wok-tossed noodles with crunchy vegetables and Indo-Chinese seasoning.",
    createdAt: new Date("2026-07-19").toISOString()
  },
  {
    id: "item-crispy-fries",
    shopId: "shop-fast-lane",
    name: "Peri Peri French Fries",
    category: "Fast Food",
    foodType: "veg",
    price: 99,
    rating: 4.3,
    image: dishImage("peri peri french fries"),
    description: "Golden fries tossed with tangy peri peri masala.",
    createdAt: new Date("2026-07-20").toISOString()
  },
  {
    id: "item-paneer-roll",
    shopId: "shop-fast-lane",
    name: "Paneer Kathi Roll",
    category: "Fast Food",
    foodType: "veg",
    price: 119,
    rating: 4.5,
    image: dishImage("paneer kathi roll"),
    description: "Soft paratha loaded with paneer tikka, onions, and mint sauce.",
    createdAt: new Date("2026-07-21").toISOString()
  },
  {
    id: "item-crispy-sandwich",
    shopId: "shop-fast-lane",
    name: "Crispy Chicken Sandwich",
    category: "Sandwiches",
    foodType: "non veg",
    price: 179,
    rating: 4.5,
    image: dishImage("crispy chicken sandwich"),
    description: "Toasted sandwich with crispy chicken, cheese, lettuce, and mayo.",
    createdAt: new Date("2026-07-22").toISOString()
  }
];

export const seedData: FoodistarData = {
  shops: seedShops,
  items: seedItems,
  orders: [],
  favoritesByUser: {}
};
