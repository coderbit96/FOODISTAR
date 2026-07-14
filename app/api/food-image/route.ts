import { NextResponse } from "next/server";

type ImageMatch = {
  keywords: string[];
  urls: string[];
};

const localFallbacks = [
  "/food/image2.webp",
  "/food/image10.avif",
  "/food/image1.jpg",
  "/food/image3.jpg"
];

const imageMatches: ImageMatch[] = [
  {
    keywords: ["shorshe", "ilish", "fish", "bengali fish"],
    urls: [
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=80",
      "/food/image2.webp"
    ]
  },
  {
    keywords: ["kosha", "mangsho", "mutton", "curry"],
    urls: [
      "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=900&q=80",
      "/food/image2.webp"
    ]
  },
  {
    keywords: ["chingri", "malai", "prawn", "shrimp"],
    urls: [
      "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=80",
      "/food/image2.webp"
    ]
  },
  {
    keywords: ["biryani", "pulao", "rice"],
    urls: [
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=80",
      "/food/image2.webp"
    ]
  },
  {
    keywords: ["paneer", "butter masala", "indian curry"],
    urls: [
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80",
      "/food/image8.avif"
    ]
  },
  {
    keywords: ["aloo posto", "alur dom", "luchi"],
    urls: [
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
      "/food/image1.jpg"
    ]
  },
  {
    keywords: ["samosa", "chai", "tea"],
    urls: [
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
      "/food/image1.jpg"
    ]
  },
  {
    keywords: ["mishti", "rosogolla", "dessert", "doi", "sweet"],
    urls: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
      "/food/image3.jpg"
    ]
  },
  {
    keywords: ["roll", "kathi", "wrap", "mughlai", "paratha"],
    urls: [
      "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80",
      "/food/image10.avif"
    ]
  },
  {
    keywords: ["momo", "momos", "dumpling"],
    urls: [
      "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=900&q=80",
      "/food/image9.jpg"
    ]
  },
  {
    keywords: ["noodle", "hakka", "chinese"],
    urls: [
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
      "/food/image9.jpg"
    ]
  },
  {
    keywords: ["dosa", "south indian"],
    urls: [
      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80",
      "/food/image7.jpg"
    ]
  },
  {
    keywords: ["pizza", "margherita"],
    urls: [
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
      "/food/image4.avif"
    ]
  },
  {
    keywords: ["burger", "cheese burger"],
    urls: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
      "/food/image5.jpg"
    ]
  },
  {
    keywords: ["fries", "peri peri"],
    urls: [
      "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=900&q=80",
      "/food/image10.avif"
    ]
  },
  {
    keywords: ["sandwich"],
    urls: [
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80",
      "/food/image6.jpg"
    ]
  }
];

function findImages(searchText: string) {
  const normalized = searchText.toLowerCase();
  const match = imageMatches.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword))
  );

  return [...(match?.urls || []), ...localFallbacks];
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "";
  const category = searchParams.get("category") || "";
  const urls = Array.from(new Set(findImages(`${name} ${category}`)));

  return NextResponse.json({
    imageUrl: urls[0],
    fallbackUrls: urls,
    name,
    category
  });
}
