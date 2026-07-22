"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { IndianRupee, MapPin, PackageCheck, Search, SlidersHorizontal, Sparkles, Store, Truck, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { ProtectedPage } from "@/components/protected-page";
import { FoodCard } from "@/components/food-card";
import { FoodImage } from "@/components/food-image";
import { useRasoiGo } from "@/components/app-provider";
import { categories, categoryImages } from "@/lib/catalog";

export default function HomePage() {
  const { data, profile, recordSearch } = useRasoiGo();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [foodType, setFoodType] = useState("all");
  const [city, setCity] = useState("All");
  const [priceRange, setPriceRange] = useState("all");
  const [minRating, setMinRating] = useState("0");
  const [sort, setSort] = useState("popular");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return data.items
      .filter((item) => {
        const shop = data.shops.find((entry) => entry.id === item.shopId);
        const matchesQuery =
          !normalizedQuery ||
          item.name.toLowerCase().includes(normalizedQuery) ||
          item.description.toLowerCase().includes(normalizedQuery) ||
          shop?.name.toLowerCase().includes(normalizedQuery);
        const matchesCategory = category === "All" || item.category === category;
        const matchesFoodType = foodType === "all" || item.foodType === foodType;
        const matchesCity = city === "All" || shop?.city === city;
        const matchesRating = item.rating >= Number(minRating);
        const matchesPrice =
          priceRange === "all" ||
          (priceRange === "under-150" && item.price < 150) ||
          (priceRange === "150-300" && item.price >= 150 && item.price <= 300) ||
          (priceRange === "above-300" && item.price > 300);
        return Boolean(shop?.open) && !shop?.busy && item.available !== false && matchesQuery && matchesCategory && matchesFoodType && matchesCity && matchesRating && matchesPrice;
      })
      .sort((left, right) => {
        if (sort === "price-low") return left.price - right.price;
        if (sort === "latest") return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
        return right.rating - left.rating;
      });
  }, [category, city, data.items, data.shops, foodType, minRating, priceRange, query, sort]);

  const cities = useMemo(() => ["All", ...Array.from(new Set(data.shops.map((shop) => shop.city)))], [data.shops]);
  const recentSearches = useMemo(() => (
    profile ? data.recentSearchesByUser[profile.uid] || [] : []
  ), [data.recentSearchesByUser, profile]);
  const searchSuggestions = useMemo(() => {
    const terms = [...data.items.map((item) => item.name), ...data.shops.map((shop) => shop.name), ...recentSearches];
    return Array.from(new Set(terms)).filter((term) => term.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8);
  }, [data.items, data.shops, query, recentSearches]);
  const recommendedItems = useMemo(() => filteredItems.filter((item) => item.rating >= 4.7).slice(0, 4), [filteredItems]);

  const heroItems = useMemo(() => {
    const featuredItems = data.items.slice(0, 9);
    return [...featuredItems, ...featuredItems];
  }, [data.items]);
  const deliveryOrders = useMemo(() => {
    if (profile?.role !== "delivery") return [];
    return data.orders.filter((order) => !["delivered", "cancelled"].includes(order.status));
  }, [data.orders, profile]);
  const assignedDelivery = useMemo(() => (
    profile?.role === "delivery"
      ? data.orders.find((order) => order.deliveryPartnerId === profile.uid && order.status === "out-for-delivery")
      : undefined
  ), [data.orders, profile]);
  const deliveryWallet = useMemo(() => (
    profile?.role === "delivery"
      ? data.wallet.filter((entry) => entry.userId === profile.uid && entry.type === "delivery-earning")
      : []
  ), [data.wallet, profile]);
  const deliveryIncome = deliveryWallet.reduce((total, entry) => total + entry.amount, 0);
  const deliveredCount = profile?.role === "delivery"
    ? data.orders.filter((order) => order.deliveryPartnerId === profile.uid && order.status === "delivered").length
    : 0;
  const completedDeliveryOrders = profile?.role === "delivery"
    ? data.orders.filter((order) => order.deliveryPartnerId === profile.uid && order.status === "delivered")
    : [];
  const cancelledDeliveryOrders = profile?.role === "delivery"
    ? data.orders.filter((order) => order.deliveryPartnerId === profile.uid && order.status === "cancelled")
    : [];
  const incomingOrderValue = deliveryOrders.reduce((total, order) => total + order.total, 0);
  const completedOrderValue = completedDeliveryOrders.reduce((total, order) => total + order.total, 0);
  const cancelledOrderValue = cancelledDeliveryOrders.reduce((total, order) => total + order.total, 0);
  const availableDeliveryOrders = deliveryOrders.filter((order) => !order.deliveryPartnerId && ["received", "preparing", "out-for-delivery"].includes(order.status));
  const codAmount = deliveryOrders
    .filter((order) => order.paymentMethod === "cash")
    .reduce((total, order) => total + order.total, 0);
  const heroCopy = {
    user: {
      badge: "Fresh from Kolkata kitchens",
      title: "Hot Bengali bites, street snacks, and comfort meals.",
      subtitle: "From kosha mangsho to crispy rolls, discover hand-picked dishes, fill your cart fast, and let RasoiGo bring the feast home."
    },
    owner: {
      badge: "Kitchen command center",
      title: "Manage your menu and keep every kitchen order moving.",
      subtitle: "Add fresh dishes, track incoming orders, and move each RasoiGo request from received to ready for delivery."
    },
    delivery: {
      badge: "Delivery partner mode",
      title: "Pick up hot orders and finish every drop on time.",
      subtitle: "Watch the active RasoiGo queue, collect orders from kitchens, and mark deliveries the moment they reach the customer."
    },
    admin: {
      badge: "Admin control room",
      title: "Watch every RasoiGo role, order, shop, and rupee.",
      subtitle: "Open the admin dashboard to manage users, restaurants, menu items, orders, revenue, and platform cleanup."
    }
  }[profile?.role || "user"];

  if (profile?.role === "delivery") {
    return (
      <ProtectedPage>
        <main className="mx-auto w-full max-w-6xl px-4 py-6">
          <section className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-flex rounded-lg bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#f04423]">
                  Delivery partner
                </span>
                <h1 className="mt-3 text-3xl font-black text-slate-950">Delivery dashboard</h1>
                <p className="mt-2 text-sm text-slate-500">Track assignments, earnings, cash collection, and profile details.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/orders" className="brand-focus rounded-lg bg-[#f04423] px-4 py-3 text-sm font-black text-white">
                  Delivery orders
                </Link>
                <Link href="/profile" className="brand-focus rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white">
                  Profile
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-orange-100 bg-white p-4 shadow-sm">
              <Truck className="text-[#f04423]" />
              <p className="mt-3 text-sm text-slate-500">Incoming orders</p>
              <p className="text-3xl font-black text-slate-950">{deliveryOrders.length}</p>
              <p className="text-xs font-bold text-slate-500">Value Rs {incomingOrderValue}</p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-white p-4 shadow-sm">
              <PackageCheck className="text-[#f04423]" />
              <p className="mt-3 text-sm text-slate-500">Completed</p>
              <p className="text-3xl font-black text-slate-950">{completedDeliveryOrders.length}</p>
              <p className="text-xs font-bold text-slate-500">Value Rs {completedOrderValue}</p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-white p-4 shadow-sm">
              <IndianRupee className="text-[#f04423]" />
              <p className="mt-3 text-sm text-slate-500">Income</p>
              <p className="text-3xl font-black text-slate-950">Rs {deliveryIncome}</p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-white p-4 shadow-sm">
              <UserRound className="text-[#f04423]" />
              <p className="mt-3 text-sm text-slate-500">Cancelled</p>
              <p className="text-3xl font-black text-slate-950">{cancelledDeliveryOrders.length}</p>
              <p className="text-xs font-bold text-slate-500">Value Rs {cancelledOrderValue}</p>
            </div>
          </section>

          <section className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-orange-100 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Available to accept</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{availableDeliveryOrders.length}</p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">COD to collect</p>
              <p className="mt-1 text-2xl font-black text-slate-950">Rs {codAmount}</p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Assigned completed</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{deliveredCount}</p>
            </div>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-black text-slate-950">Live delivery work</h2>
              {assignedDelivery ? (
                <div className="mt-4 rounded-lg bg-orange-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f04423]">Active assignment</p>
                  <h3 className="mt-2 text-xl font-black text-slate-950">Order #{assignedDelivery.id.slice(0, 10)}</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs font-black text-slate-400">Package</p>
                      <p className="font-black text-slate-950">{assignedDelivery.items.reduce((total, item) => total + item.quantity, 0)} items</p>
                    </div>
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs font-black text-slate-400">Order price</p>
                      <p className="font-black text-slate-950">Rs {assignedDelivery.total} . {assignedDelivery.paymentMethod === "cash" ? "COD" : "Online paid"}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600"><MapPin className="mr-1 inline text-[#f04423]" size={16} />{assignedDelivery.address}</p>
                  <Link href="/orders" className="brand-focus mt-4 inline-flex rounded-lg bg-[#f04423] px-4 py-3 text-sm font-black text-white">
                    Open OTP delivery
                  </Link>
                </div>
              ) : (
                <div className="mt-4 rounded-lg bg-slate-50 p-5 text-sm font-semibold text-slate-600">
                  No active assignment. Accept one order from the delivery queue.
                </div>
              )}

              <div className="mt-5 grid gap-3">
                {availableDeliveryOrders.slice(0, 4).map((order) => {
                  const pickupShops = Array.from(new Set(order.items.map((item) => item.shopId)))
                    .map((shopId) => data.shops.find((shop) => shop.id === shopId)?.name)
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <article key={order.id} className="rounded-lg border border-orange-100 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f04423]">New assignment</p>
                          <h3 className="mt-1 font-black text-slate-950">Order #{order.id.slice(0, 10)}</h3>
                          <p className="mt-1 text-sm text-slate-500">Pickup: {pickupShops || "Restaurant kitchen"}</p>
                          <p className="mt-1 text-sm text-slate-500">Package: {order.items.reduce((total, item) => total + item.quantity, 0)} items</p>
                        </div>
                        <div className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-black text-[#f04423]">
                          Rs {order.total}
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">{order.paymentMethod === "cash" ? "Collect cash from customer" : "Online paid"} . Earning Rs 45</p>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-lg border border-orange-100 bg-slate-950 p-5 text-white shadow-sm">
              <h2 className="text-2xl font-black">Partner profile</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p><span className="font-black text-white">Name:</span> {profile.fullName}</p>
                <p><span className="font-black text-white">Email:</span> {profile.email}</p>
                <p><span className="font-black text-white">Status:</span> Available for assignments</p>
                <p><span className="font-black text-white">Base earning:</span> Rs 45 per delivery</p>
                <p><span className="font-black text-white">Avg earning:</span> Rs {deliveredCount ? Math.round(deliveryIncome / deliveredCount) : 0}</p>
              </div>
              <div className="mt-5 grid gap-2">
                <Link href="/orders" className="brand-focus rounded-lg bg-white px-4 py-3 text-center text-sm font-black text-slate-950">
                  View delivery queue
                </Link>
                <Link href="/profile" className="brand-focus rounded-lg bg-[#f04423] px-4 py-3 text-center text-sm font-black text-white">
                  Edit profile
                </Link>
              </div>
            </aside>
          </section>
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <section>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-lg border border-orange-100 bg-[#fff3cf] shadow-sm"
          >
            <div className="p-5 md:p-6">
              <div className="relative flex min-h-[330px] flex-col gap-4 overflow-hidden md:min-h-[360px] md:flex-row md:items-start md:justify-between">
                <div className="relative z-10 max-w-3xl md:pr-44 lg:max-w-4xl lg:pr-56">
                  <span className="mb-3 inline-flex rounded-lg bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#f04423]">
                    {heroCopy.badge}
                  </span>
                  <h1 className="text-3xl font-black leading-tight text-slate-950 md:text-5xl">
                    {heroCopy.title}
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-slate-500 md:text-base">
                    {heroCopy.subtitle}
                  </p>
                </div>

                <motion.div
                  aria-hidden="true"
                  initial={{ opacity: 0, scale: 0.92, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: -2 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.12 }}
                  className="pointer-events-none absolute bottom-0 right-1 hidden h-[320px] w-[230px] sm:block md:right-24 md:h-[360px] md:w-[260px] lg:right-32 lg:h-[410px] lg:w-[300px]"
                >
                  <img
                    src="/food/chef-mascot-cutout.png"
                    alt=""
                    className="h-full w-full object-contain object-bottom drop-shadow-2xl"
                  />
                </motion.div>

                <div className="relative z-10 flex shrink-0 flex-wrap gap-3">
                  {profile?.role === "user" && (
                    <Link href="/cart" className="brand-focus rounded-full bg-[#f04423] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200">
                      Open cart
                    </Link>
                  )}
                  {profile?.role === "owner" && (
                    <Link href="/owner" className="brand-focus rounded-full bg-[#f04423] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200">
                      Add item
                    </Link>
                  )}
                  {profile?.role !== "user" && (
                    <Link href={profile?.role === "admin" ? "/admin" : "/orders"} className="brand-focus rounded-full border border-orange-100 bg-orange-50 px-5 py-3 text-sm font-black text-[#f04423]">
                      {profile?.role === "admin" ? "Admin dashboard" : "Kitchen orders"}
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-6 overflow-hidden pb-2">
                <div className="rasoigo-hero-rail flex w-max gap-4">
                {heroItems.map((item, index) => (
                  <button
                    key={`${item.id}-${index}`}
                    className="brand-focus group relative h-44 min-w-[230px] overflow-hidden rounded-lg bg-orange-50 text-left shadow-sm ring-1 ring-orange-100 md:h-52 md:min-w-[300px]"
                    onClick={() => {
                      setQuery(item.name);
                      recordSearch(item.name);
                    }}
                  >
                    <FoodImage src={item.image} name={item.name} category={item.category} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="truncate text-lg font-black">{item.name}</p>
                      <p className="mt-1 text-sm font-bold text-orange-100">Rs {item.price} . {item.category}</p>
                    </div>
                  </button>
                ))}
                </div>
              </div>
            </div>
          </motion.div>

        </section>

        <section className="mt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">Browse RasoiGo</h2>
              <p className="mt-1 text-sm text-slate-500">Filter dishes by category, preference, or freshness.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="brand-focus flex min-w-0 items-center gap-2 rounded-lg border border-orange-100 bg-white px-3 py-2 shadow-sm">
                <Search size={18} className="shrink-0 text-[#f04423]" />
                <input
                  list="rasoigo-search-suggestions"
                  className="w-full min-w-0 border-0 bg-transparent text-sm outline-none"
                  placeholder="Search food or shops"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onBlur={() => recordSearch(query)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") recordSearch(query);
                  }}
                />
                <datalist id="rasoigo-search-suggestions">
                  {searchSuggestions.map((term) => <option key={term} value={term} />)}
                </datalist>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-orange-100 bg-white px-3 py-2 shadow-sm">
                <SlidersHorizontal size={18} className="text-[#f04423]" />
                <select className="bg-transparent text-sm font-semibold outline-none" value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="popular">Popular</option>
                  <option value="latest">Latest</option>
                  <option value="price-low">Price low</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <button
                key={term}
                className="brand-focus rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-orange-100"
                onClick={() => {
                  setQuery(term);
                  recordSearch(term);
                }}
              >
                {term}
              </button>
            ))}
          </div>

          <div
            className="mt-4 flex gap-3 overflow-x-auto pb-2"
          >
            {categories.map((entry) => (
              <button
                key={entry}
                className={clsx(
                  "brand-focus flex min-w-32 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-black transition",
                  category === entry ? "border-[#f04423] bg-[#f04423] text-white" : "border-orange-100 bg-white text-slate-700"
                )}
                onClick={() => setCategory(entry)}
              >
                <img src={categoryImages[entry]} alt="" className="h-9 w-9 rounded-lg object-cover" />
                {entry}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {["all", "veg", "non veg"].map((option) => (
              <button
                key={option}
                className={clsx(
                  "brand-focus rounded-lg px-3 py-2 text-sm font-black capitalize",
                  foodType === option ? "bg-slate-950 text-white" : "bg-white text-slate-600 ring-1 ring-orange-100"
                )}
                onClick={() => setFoodType(option)}
              >
                {option}
              </button>
            ))}
            <label className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-black text-slate-600 ring-1 ring-orange-100">
              <MapPin size={16} className="text-[#f04423]" />
              <select className="bg-transparent outline-none" value={city} onChange={(event) => setCity(event.target.value)}>
                {cities.map((entry) => <option key={entry}>{entry}</option>)}
              </select>
            </label>
            <label className="rounded-lg bg-white px-3 py-2 text-sm font-black text-slate-600 ring-1 ring-orange-100">
              <select className="bg-transparent outline-none" value={priceRange} onChange={(event) => setPriceRange(event.target.value)}>
                <option value="all">All prices</option>
                <option value="under-150">Under Rs 150</option>
                <option value="150-300">Rs 150 - 300</option>
                <option value="above-300">Above Rs 300</option>
              </select>
            </label>
            <label className="rounded-lg bg-white px-3 py-2 text-sm font-black text-slate-600 ring-1 ring-orange-100">
              <select className="bg-transparent outline-none" value={minRating} onChange={(event) => setMinRating(event.target.value)}>
                <option value="0">Any rating</option>
                <option value="4.3">4.3+</option>
                <option value="4.5">4.5+</option>
                <option value="4.7">4.7+</option>
              </select>
            </label>
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center gap-2">
            <Store className="text-[#f04423]" />
            <h2 className="text-2xl font-black text-slate-950">City shops</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {data.shops.filter((shop) => city === "All" || shop.city === city).map((shop) => (
              <button
                key={shop.id}
                className="brand-focus rounded-lg border border-orange-100 bg-white p-3 text-left shadow-sm"
                onClick={() => setQuery(shop.name)}
              >
                <div className="flex items-center gap-3">
                  <img src={shop.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">{shop.name}</p>
                    <p className="text-sm text-slate-500">{shop.city} . {shop.cuisine}</p>
                    <p className="text-xs font-bold text-[#f04423]">{shop.busy ? "Busy now" : shop.open ? shop.deliveryTime : "Closed"}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {profile?.role === "user" && recommendedItems.length > 0 && (
          <section className="mt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="text-[#f04423]" />
              <h2 className="text-2xl font-black text-slate-950">Recommended for you</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recommendedItems.map((item) => <FoodCard key={`recommended-${item.id}`} item={item} />)}
            </div>
          </section>
        )}

        <motion.section layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </motion.section>

        {filteredItems.length === 0 && (
          <div className="mt-6 rounded-lg border border-orange-100 bg-white p-8 text-center">
            <Store className="mx-auto text-[#f04423]" />
            <p className="mt-3 font-black text-slate-950">No matching dishes found.</p>
          </div>
        )}
      </main>
    </ProtectedPage>
  );
}
