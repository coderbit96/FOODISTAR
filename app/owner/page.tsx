"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Camera, Pencil, Store, Trash2, UploadCloud, Utensils } from "lucide-react";
import { ProtectedPage } from "@/components/protected-page";
import { useRasoiGo } from "@/components/app-provider";
import { FoodImage } from "@/components/food-image";
import { categories } from "@/lib/catalog";

export default function OwnerPage() {
  const router = useRouter();
  const { profile, data, ownerShop, addOwnerItem, updateOwnerItem, deleteOwnerItem, updateOwnerShop } = useRasoiGo();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Snacks");
  const [foodType, setFoodType] = useState<"veg" | "non veg">("veg");
  const [price, setPrice] = useState(99);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [shopImageFile, setShopImageFile] = useState<File | null>(null);
  const [editingItemId, setEditingItemId] = useState("");
  const [shopName, setShopName] = useState(ownerShop?.name || "");
  const [shopCity, setShopCity] = useState(ownerShop?.city || "Kolkata");
  const [openingTime, setOpeningTime] = useState(ownerShop?.openingTime || "10:00");
  const [closingTime, setClosingTime] = useState(ownerShop?.closingTime || "23:00");
  const [busyMode, setBusyMode] = useState(Boolean(ownerShop?.busy));
  const [shopOpen, setShopOpen] = useState(ownerShop?.open ?? true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const ownerItems = useMemo(() => {
    if (!ownerShop) return [];
    return data.items.filter((item) => item.shopId === ownerShop.id);
  }, [data.items, ownerShop]);

  const ownerOrders = useMemo(() => {
    if (!ownerShop) return [];
    return data.orders.filter((order) => order.items.some((item) => item.shopId === ownerShop.id));
  }, [data.orders, ownerShop]);

  const revenue = ownerOrders
    .filter((order) => order.status === "delivered")
    .reduce((total, order) => total + order.items.filter((item) => item.shopId === ownerShop?.id).reduce((sum, item) => sum + item.price * item.quantity, 0), 0);
  const topItems = ownerItems
    .map((item) => ({
      name: item.name,
      count: ownerOrders.reduce((total, order) => total + order.items.filter((entry) => entry.id === item.id).reduce((sum, entry) => sum + entry.quantity, 0), 0)
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 4);
  const hourlyOrders = Array.from({ length: 6 }, (_, index) => {
    const hour = 12 + index * 2;
    const count = ownerOrders.filter((order) => new Date(order.createdAt).getHours() >= hour && new Date(order.createdAt).getHours() < hour + 2).length;
    return { label: `${hour}:00`, count };
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (editingItemId) {
        await updateOwnerItem({ id: editingItemId, name, category, foodType, price, description, imageFile });
      } else {
        await addOwnerItem({ name, category, foodType, price, description, imageFile });
      }
      setEditingItemId("");
      setName("");
      setDescription("");
      setImageFile(null);
      setMessage("Item saved to RasoiGo. Image upload used Firebase Storage when a file was selected.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to add item.");
    } finally {
      setBusy(false);
    }
  };

  const saveShop = async () => {
    setBusy(true);
    setMessage("");
    try {
      await updateOwnerShop({
        name: shopName || ownerShop?.name,
        city: shopCity,
        open: shopOpen,
        busy: busyMode,
        openingTime,
        closingTime,
        imageFile: shopImageFile
      });
      setMessage("Shop settings saved.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to save shop.");
    } finally {
      setBusy(false);
    }
  };

  if (profile?.role !== "owner") {
    return (
      <ProtectedPage>
        <main className="mx-auto w-full max-w-3xl px-4 py-10">
          <div className="rounded-lg border border-orange-100 bg-white p-8 text-center shadow-sm">
            <Store className="mx-auto text-[#f04423]" />
            <h1 className="mt-3 text-2xl font-black text-slate-950">Owner access only</h1>
            <p className="mt-2 text-sm text-slate-500">Change your role from Profile to create and upload menu items.</p>
            <button className="brand-focus mt-4 rounded-lg bg-[#f04423] px-4 py-3 text-sm font-black text-white" onClick={() => router.push("/profile")}>
              Open profile
            </button>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <main className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-3 text-[#f04423]"><Utensils /></div>
            <div>
              <h1 className="text-3xl font-black text-slate-950">Owner menu</h1>
              <p className="text-sm text-slate-500">{ownerShop?.name || "A shop will be created automatically."}</p>
            </div>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={submit}>
            <label>
              <span className="text-sm font-black text-slate-700">Dish name</span>
              <input className="brand-focus mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm" value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label>
                <span className="text-sm font-black text-slate-700">Category</span>
                <select className="brand-focus mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm" value={category} onChange={(event) => setCategory(event.target.value)}>
                  {categories.filter((entry) => entry !== "All").map((entry) => <option key={entry}>{entry}</option>)}
                </select>
              </label>
              <label>
                <span className="text-sm font-black text-slate-700">Food type</span>
                <select className="brand-focus mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm" value={foodType} onChange={(event) => setFoodType(event.target.value as "veg" | "non veg")}>
                  <option value="veg">Veg</option>
                  <option value="non veg">Non veg</option>
                </select>
              </label>
              <label>
                <span className="text-sm font-black text-slate-700">Price</span>
                <input type="number" min={1} className="brand-focus mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm" value={price} onChange={(event) => setPrice(Number(event.target.value))} required />
              </label>
            </div>
            <label>
              <span className="text-sm font-black text-slate-700">Description</span>
              <textarea className="brand-focus mt-2 min-h-24 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm" value={description} onChange={(event) => setDescription(event.target.value)} required />
            </label>
            <label className="brand-focus flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-orange-200 bg-orange-50 px-4 py-4">
              <span className="flex items-center gap-3 text-sm font-black text-slate-700"><Camera className="text-[#f04423]" /> {imageFile?.name || "Choose food image"}</span>
              <UploadCloud className="text-[#f04423]" />
              <input type="file" accept="image/*" className="hidden" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
            </label>
            {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
            <button className="brand-focus rounded-lg bg-[#f04423] px-4 py-3 text-sm font-black text-white disabled:opacity-60" disabled={busy}>
              {busy ? "Saving..." : "Save item"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">Shop settings</h2>
          <div className="mt-4 grid gap-3">
            <input className="brand-focus rounded-lg border border-slate-200 px-3 py-3 text-sm" value={shopName} onChange={(event) => setShopName(event.target.value)} placeholder={ownerShop?.name || "Shop name"} />
            <div className="grid gap-3 sm:grid-cols-3">
              <input className="brand-focus rounded-lg border border-slate-200 px-3 py-3 text-sm" value={shopCity} onChange={(event) => setShopCity(event.target.value)} placeholder="City" />
              <input type="time" className="brand-focus rounded-lg border border-slate-200 px-3 py-3 text-sm" value={openingTime} onChange={(event) => setOpeningTime(event.target.value)} />
              <input type="time" className="brand-focus rounded-lg border border-slate-200 px-3 py-3 text-sm" value={closingTime} onChange={(event) => setClosingTime(event.target.value)} />
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm font-black text-slate-700">
                <input type="checkbox" checked={shopOpen} onChange={(event) => setShopOpen(event.target.checked)} />
                Open
              </label>
              <label className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm font-black text-slate-700">
                <input type="checkbox" checked={busyMode} onChange={(event) => setBusyMode(event.target.checked)} />
                Busy mode
              </label>
              <label className="brand-focus rounded-lg border border-dashed border-orange-200 bg-orange-50 px-3 py-2 text-sm font-black text-slate-700">
                {shopImageFile?.name || "Shop image"}
                <input type="file" accept="image/*" className="hidden" onChange={(event) => setShopImageFile(event.target.files?.[0] || null)} />
              </label>
              <button className="brand-focus rounded-lg bg-[#f04423] px-4 py-2 text-sm font-black text-white" onClick={saveShop} disabled={busy}>
                Save shop
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-slate-950 p-4 text-white">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-orange-200" />
              <h3 className="text-xl font-black">Analytics</h3>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div><p className="text-xs text-slate-300">Revenue</p><p className="text-2xl font-black">Rs {revenue}</p></div>
              <div><p className="text-xs text-slate-300">Orders</p><p className="text-2xl font-black">{ownerOrders.length}</p></div>
              <div><p className="text-xs text-slate-300">Items</p><p className="text-2xl font-black">{ownerItems.length}</p></div>
            </div>
            <div className="mt-4 grid gap-2">
              {topItems.map((item) => <p key={item.name} className="text-sm text-slate-200">{item.name}: {item.count} sold</p>)}
            </div>
            <div className="mt-4 flex items-end gap-2">
              {hourlyOrders.map((entry) => (
                <div key={entry.label} className="flex flex-1 flex-col items-center gap-1 text-xs text-slate-300">
                  <div className="w-full rounded-t bg-[#f04423]" style={{ height: `${Math.max(8, entry.count * 18)}px` }} />
                  {entry.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-2xl font-black text-slate-950">Your items</h2>
          <div className="mt-4 grid gap-3">
            {ownerItems.map((item) => (
              <article key={item.id} className="flex gap-3 rounded-lg bg-slate-50 p-3">
                <FoodImage src={item.image} name={item.name} category={item.category} className="h-20 w-20 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black text-slate-950">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.category} . Rs {item.price}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="brand-focus rounded-lg bg-white p-2 text-slate-700 ring-1 ring-slate-200"
                    onClick={() => {
                      setEditingItemId(item.id);
                      setName(item.name);
                      setCategory(item.category);
                      setFoodType(item.foodType);
                      setPrice(item.price);
                      setDescription(item.description);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button className="brand-focus rounded-lg bg-red-50 p-2 text-red-700" onClick={() => deleteOwnerItem(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
            {ownerItems.length === 0 && <p className="rounded-lg bg-orange-50 p-4 text-sm font-semibold text-slate-600">No owner items yet.</p>}
          </div>
        </section>
      </main>
    </ProtectedPage>
  );
}
