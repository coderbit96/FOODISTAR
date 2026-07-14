"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Store, UploadCloud, Utensils } from "lucide-react";
import { ProtectedPage } from "@/components/protected-page";
import { useFoodistar } from "@/components/app-provider";
import { FoodImage } from "@/components/food-image";
import { categories } from "@/lib/catalog";

export default function OwnerPage() {
  const router = useRouter();
  const { profile, data, ownerShop, addOwnerItem } = useFoodistar();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Snacks");
  const [foodType, setFoodType] = useState<"veg" | "non veg">("veg");
  const [price, setPrice] = useState(99);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const ownerItems = useMemo(() => {
    if (!ownerShop) return [];
    return data.items.filter((item) => item.shopId === ownerShop.id);
  }, [data.items, ownerShop]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await addOwnerItem({ name, category, foodType, price, description, imageFile });
      setName("");
      setDescription("");
      setImageFile(null);
      setMessage("Item saved to FOODISTAR. Image upload used Firebase Storage when a file was selected.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to add item.");
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
          <h2 className="text-2xl font-black text-slate-950">Your items</h2>
          <div className="mt-4 grid gap-3">
            {ownerItems.map((item) => (
              <article key={item.id} className="flex gap-3 rounded-lg bg-slate-50 p-3">
                <FoodImage src={item.image} name={item.name} category={item.category} className="h-20 w-20 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-black text-slate-950">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.category} . Rs {item.price}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description}</p>
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
