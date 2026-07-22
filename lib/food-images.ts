const localImages = {
  samosa: "/food/image1.jpg",
  pizza: "/food/image4.avif",
  burger: "/food/image5.jpg",
  sandwich: "/food/image6.jpg",
  dosa: "/food/image7.jpg",
  thali: "/food/image8.avif",
  noodles: "/food/image9.jpg",
  fastFood: "/food/image11.jpg"
};

const commonsImage = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(fileName)}?width=900`;

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const exactDishImages: Record<string, string[]> = {
  [normalize("Paneer Butter Masala")]: [
    commonsImage("Paneer butter masala 2.jpg"),
    localImages.thali
  ],
  [normalize("Kolkata Chicken Biryani")]: [
    commonsImage("Bengali style chicken biryani, Kolkata - West Bengal - DSC 0020.jpg"),
    commonsImage("Chicken Biryani - Kolkata 2015-10-10 5338.JPG")
  ],
  [normalize("Classic Margherita Pizza")]: [localImages.pizza],
  [normalize("Smoky Cheese Burger")]: [localImages.burger],
  [normalize("Masala Dosa")]: [localImages.dosa],
  [normalize("Adrak Chai and Samosa")]: [localImages.samosa],
  [normalize("Shorshe Ilish")]: [
    commonsImage("Shorshe Ilish Maach.jpg"),
    commonsImage("Sorshe Ilish (Ilish cooked in mustard gravy).jpg")
  ],
  [normalize("Kosha Mangsho")]: [
    commonsImage("Kosha Mangsho.jpg"),
    commonsImage("Mutton Kosha.jpg")
  ],
  [normalize("Chingri Malai Curry")]: [
    commonsImage("Chingri Malai Curry.jpg"),
    commonsImage("Prawn Malai Curry.jpg")
  ],
  [normalize("Aloo Posto")]: [
    commonsImage("Aloo Posto.jpg"),
    localImages.thali
  ],
  [normalize("Luchi with Alur Dom")]: [
    commonsImage("Alur dom & luchi.jpg"),
    commonsImage("Luchi Alur Dam.jpg")
  ],
  [normalize("Basanti Pulao")]: [
    commonsImage("Basanti Pulao.jpg"),
    localImages.thali
  ],
  [normalize("Kolkata Fish Fry")]: [
    commonsImage("Fish cutlet.jpg"),
    commonsImage("Kolkata Fish Fry.jpg")
  ],
  [normalize("Mishti Doi")]: [
    commonsImage("Mishti doi (Mitha Dahi).jpg"),
    commonsImage("Food-Mishti-Doi.jpg")
  ],
  [normalize("Soft Rosogolla")]: [
    commonsImage("Rosogolla 2.jpg"),
    commonsImage("Rosogolla.jpg")
  ],
  [normalize("Kolkata Egg Chicken Roll")]: [
    commonsImage("Kolkata Chicken Roll.jpg"),
    commonsImage("Lachha Paratha Egg Chicken Roll.jpg")
  ],
  [normalize("Mughlai Paratha")]: [
    commonsImage("Mughlai Paratha.jpg"),
    commonsImage("Double-Egg Moghlai Pawrota with Potato-Salad & Dal.jpg")
  ],
  [normalize("Steamed Chicken Momos")]: [
    commonsImage("Chicken Momos.jpg"),
    commonsImage("Homemade chicken momo.jpg")
  ],
  [normalize("Veg Hakka Noodles")]: [localImages.noodles],
  [normalize("Peri Peri French Fries")]: [
    commonsImage("French fries (6211716064).jpg"),
    commonsImage("French Fries.jpg")
  ],
  [normalize("Paneer Kathi Roll")]: [
    commonsImage("Paneer kathi roll homemade.jpg"),
    commonsImage("Kathi Roll.jpg")
  ],
  [normalize("Crispy Chicken Sandwich")]: [
    localImages.sandwich,
    commonsImage("Fried chicken sandwich with comeback sauce.jpg")
  ],
  [normalize("Kolkata Fuchka")]: [
    commonsImage("Fuchka or Panipuri in Kolkata.jpg"),
    commonsImage("Fuchka.jpg")
  ],
  [normalize("Chicken Chaap")]: [
    commonsImage("Chicken Chaap - Howrah 2014-10-03 9381.JPG"),
    commonsImage("Chicken chaap.jpg")
  ],
  [normalize("Nolen Gur Sandesh")]: [
    commonsImage("Gur er Sandesh.jpg"),
    commonsImage("Bengali Sandesh - 1.jpg")
  ],
  [normalize("Veg Thin Crust Pizza")]: [
    commonsImage("Veg Thin Crust Pizza.jpg"),
    commonsImage("Vegetarian Pizza.jpg")
  ],
  [normalize("Crispy Chicken Burger")]: [
    commonsImage("Fried chicken burger .jpg"),
    commonsImage("Chicken Burger (16700748189).jpg")
  ],
  [normalize("Dhokar Dalna")]: [
    commonsImage("Dhokar dalna.jpg"),
    commonsImage("Traditional Bengali Thali (veg).jpg")
  ],
  [normalize("Idli Sambar")]: [
    commonsImage("Idli Sambar-Noida-UP-SP004.jpg"),
    commonsImage("Idli sambar.JPG")
  ],
  [normalize("Dal Makhani")]: [
    commonsImage("Dal Makhani.jpg"),
    commonsImage("Dal Makhani along with Naan.jpg")
  ],
  [normalize("Chilli Chicken")]: [
    commonsImage("CHILLI CHICKEN.jpg"),
    commonsImage("Chinese Chilli chicken.jpg")
  ],
  [normalize("Grilled Cheese Sandwich")]: [
    commonsImage("Grilled cheese sandwich.jpg"),
    localImages.sandwich
  ],
  [normalize("Veg Spring Rolls")]: [
    commonsImage("Veg spring roll.jpg"),
    commonsImage("Chinese Vegetable Spring Roll.jpg")
  ],
  [normalize("Masala Chai")]: [
    commonsImage("Masala Tea - 2.jpg"),
    commonsImage("Masala Tea.jpg")
  ],
  [normalize("Rajma Chawal")]: [
    commonsImage("Rajma Chawal.JPG"),
    commonsImage("Rajma Chawal, from India.jpg")
  ],
  [normalize("Pav Bhaji")]: [
    commonsImage("Pav bhaji.jpg"),
    commonsImage("Pav bhaji from Mumbai.JPG")
  ],
  [normalize("Medu Vada")]: [
    commonsImage("Medu Vada with chutnies.jpg"),
    commonsImage("Medu Vada.jpg")
  ],
  [normalize("Gulab Jamun")]: [
    commonsImage("Gulab Jamun.jpg"),
    commonsImage("Bowl of Gulab Jamun.JPG")
  ],
  [normalize("Veg Manchurian")]: [
    commonsImage("Vegetable manchurian.jpg"),
    commonsImage("Veg manchurian recipe.jpg")
  ],
  [normalize("BBQ Chicken Pizza")]: [
    commonsImage("BBQ Chicken Pizza with Pineapple.jpg"),
    commonsImage("B.B.Q. Chicken Pizza (26679384893).jpg")
  ],
  [normalize("Veggie Burger")]: [
    commonsImage("Veg Bean Burger with Fries.jpg"),
    commonsImage("Veggie burger flickr user bradleyj creative commons.jpg")
  ],
  [normalize("Egg Mayo Sandwich")]: [
    commonsImage("Egg salad sandwich.jpg"),
    commonsImage("Egg sandwich.jpg")
  ],
  [normalize("Tandoori Chicken")]: [
    commonsImage("Tandoori Chicken 1.JPG"),
    commonsImage("Tandoori Chicken with oven.jpg")
  ],
  [normalize("Chicken Lollipop")]: [
    commonsImage("Chicken lollipop in Goa.jpg"),
    commonsImage("Chicken Lollipop.jpg")
  ]
};

export const categoryImages: Record<string, string> = {
  All: localImages.fastFood,
  Snacks: localImages.samosa,
  "Main Course": localImages.thali,
  Desserts: "/food/image3.jpg",
  Pizza: localImages.pizza,
  Burgers: localImages.burger,
  Bengali: localImages.thali,
  Sandwiches: localImages.sandwich,
  "South Indian": localImages.dosa,
  "North Indian": localImages.thali,
  Chinese: localImages.noodles,
  "Fast Food": localImages.fastFood,
  "Tea Break": localImages.samosa
};

const keywordImages: Array<{ keywords: string[]; urls: string[] }> = [
  { keywords: ["paneer butter", "paneer"], urls: exactDishImages[normalize("Paneer Butter Masala")] },
  { keywords: ["biryani"], urls: exactDishImages[normalize("Kolkata Chicken Biryani")] },
  { keywords: ["pizza", "margherita"], urls: exactDishImages[normalize("Classic Margherita Pizza")] },
  { keywords: ["burger"], urls: exactDishImages[normalize("Smoky Cheese Burger")] },
  { keywords: ["dosa"], urls: exactDishImages[normalize("Masala Dosa")] },
  { keywords: ["samosa", "chai", "tea"], urls: exactDishImages[normalize("Adrak Chai and Samosa")] },
  { keywords: ["shorshe", "sorshe", "ilish"], urls: exactDishImages[normalize("Shorshe Ilish")] },
  { keywords: ["kosha", "mangsho", "mutton"], urls: exactDishImages[normalize("Kosha Mangsho")] },
  { keywords: ["chingri", "prawn", "shrimp", "malai curry"], urls: exactDishImages[normalize("Chingri Malai Curry")] },
  { keywords: ["aloo posto", "alu posto"], urls: exactDishImages[normalize("Aloo Posto")] },
  { keywords: ["luchi", "alur dom", "aloo dum"], urls: exactDishImages[normalize("Luchi with Alur Dom")] },
  { keywords: ["basanti", "pulao", "polao"], urls: exactDishImages[normalize("Basanti Pulao")] },
  { keywords: ["fish fry", "fish cutlet"], urls: exactDishImages[normalize("Kolkata Fish Fry")] },
  { keywords: ["mishti doi", "misti doi"], urls: exactDishImages[normalize("Mishti Doi")] },
  { keywords: ["rosogolla", "rasgulla"], urls: exactDishImages[normalize("Soft Rosogolla")] },
  { keywords: ["egg chicken roll", "chicken roll"], urls: exactDishImages[normalize("Kolkata Egg Chicken Roll")] },
  { keywords: ["mughlai", "moghlai"], urls: exactDishImages[normalize("Mughlai Paratha")] },
  { keywords: ["momo", "momos", "dumpling"], urls: exactDishImages[normalize("Steamed Chicken Momos")] },
  { keywords: ["hakka", "noodle", "chinese"], urls: exactDishImages[normalize("Veg Hakka Noodles")] },
  { keywords: ["fries", "french fries"], urls: exactDishImages[normalize("Peri Peri French Fries")] },
  { keywords: ["kathi roll", "paneer roll"], urls: exactDishImages[normalize("Paneer Kathi Roll")] },
  { keywords: ["fuchka", "panipuri", "pani puri"], urls: exactDishImages[normalize("Kolkata Fuchka")] },
  { keywords: ["chicken chaap", "chicken chap"], urls: exactDishImages[normalize("Chicken Chaap")] },
  { keywords: ["sandesh", "sondesh"], urls: exactDishImages[normalize("Nolen Gur Sandesh")] },
  { keywords: ["thin crust pizza", "veg pizza", "vegetarian pizza"], urls: exactDishImages[normalize("Veg Thin Crust Pizza")] },
  { keywords: ["chicken burger"], urls: exactDishImages[normalize("Crispy Chicken Burger")] },
  { keywords: ["dhokar", "dhoka dalna"], urls: exactDishImages[normalize("Dhokar Dalna")] },
  { keywords: ["idli"], urls: exactDishImages[normalize("Idli Sambar")] },
  { keywords: ["dal makhani"], urls: exactDishImages[normalize("Dal Makhani")] },
  { keywords: ["chilli chicken", "chili chicken"], urls: exactDishImages[normalize("Chilli Chicken")] },
  { keywords: ["grilled cheese"], urls: exactDishImages[normalize("Grilled Cheese Sandwich")] },
  { keywords: ["spring roll"], urls: exactDishImages[normalize("Veg Spring Rolls")] },
  { keywords: ["masala chai", "masala tea"], urls: exactDishImages[normalize("Masala Chai")] },
  { keywords: ["rajma"], urls: exactDishImages[normalize("Rajma Chawal")] },
  { keywords: ["pav bhaji"], urls: exactDishImages[normalize("Pav Bhaji")] },
  { keywords: ["medu vada", "medu wada"], urls: exactDishImages[normalize("Medu Vada")] },
  { keywords: ["gulab jamun"], urls: exactDishImages[normalize("Gulab Jamun")] },
  { keywords: ["veg manchurian", "vegetable manchurian"], urls: exactDishImages[normalize("Veg Manchurian")] },
  { keywords: ["bbq chicken pizza", "barbecue chicken pizza"], urls: exactDishImages[normalize("BBQ Chicken Pizza")] },
  { keywords: ["veggie burger", "veg burger"], urls: exactDishImages[normalize("Veggie Burger")] },
  { keywords: ["egg mayo", "egg sandwich"], urls: exactDishImages[normalize("Egg Mayo Sandwich")] },
  { keywords: ["tandoori chicken"], urls: exactDishImages[normalize("Tandoori Chicken")] },
  { keywords: ["chicken lollipop", "chicken lollypop"], urls: exactDishImages[normalize("Chicken Lollipop")] },
  { keywords: ["sandwich"], urls: exactDishImages[normalize("Crispy Chicken Sandwich")] }
];

export function getFoodImageOptions(name: string, category = "") {
  const exact = exactDishImages[normalize(name)] || [];
  const searchText = normalize(`${name} ${category}`);
  const keyword = keywordImages.find((entry) =>
    entry.keywords.some((keywordText) => searchText.includes(normalize(keywordText)))
  )?.urls || [];
  const hasSpecificMatch = exact.length > 0 || keyword.length > 0;
  const categoryImage = !hasSpecificMatch && categoryImages[category] ? [categoryImages[category]] : [];

  return Array.from(new Set([...exact, ...keyword, ...categoryImage, localImages.fastFood]));
}

export function getDishImage(name: string, category?: string) {
  return getFoodImageOptions(name, category)[0];
}
