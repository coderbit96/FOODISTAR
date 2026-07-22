import type { Metadata } from "next";

export const appName = process.env.NEXT_PUBLIC_APP_NAME || "RasoiGo";
export const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
export const defaultCity = process.env.NEXT_PUBLIC_DEFAULT_CITY || "Kolkata";

const defaultDescription =
  "Order Bengali classics, fast food, desserts, tea-time snacks, and city favorites from trusted local restaurants with RasoiGo.";

const keywords = [
  "RasoiGo",
  "food delivery",
  "online food ordering",
  `${defaultCity} food delivery`,
  "Bengali food delivery",
  "restaurant delivery",
  "fast food delivery",
  "order food online"
];

type PageSeoInput = {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
};

export function absoluteUrl(path = "/") {
  return new URL(path, appUrl).toString();
}

export function createPageMetadata({
  title,
  description = defaultDescription,
  path = "/",
  noIndex = false
}: PageSeoInput): Metadata {
  const canonical = absoluteUrl(path);
  const fullTitle = title === appName ? appName : `${title} | ${appName}`;

  return {
    title: fullTitle,
    description,
    keywords,
    alternates: {
      canonical
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false
          }
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1
          }
        },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: appName,
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: absoluteUrl("/food/chef-mascot.png"),
          width: 1200,
          height: 630,
          alt: `${appName} food delivery`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteUrl("/food/chef-mascot.png")]
    }
  };
}

