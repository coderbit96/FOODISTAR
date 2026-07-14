"use client";

import { FormEvent, useState } from "react";
import { ProtectedPage } from "@/components/protected-page";
import { useFoodistar } from "@/components/app-provider";
import type { UserRole } from "@/lib/types";

export default function ProfilePage() {
  const { profile, updateUserProfile } = useFoodistar();
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [mobile, setMobile] = useState(profile?.mobile || "");
  const [role, setRole] = useState<UserRole>(profile?.role || "user");
  const [saved, setSaved] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateUserProfile({ fullName, mobile, role });
    setSaved(true);
  };

  return (
    <ProtectedPage>
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <form className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm" onSubmit={submit}>
          <h1 className="text-3xl font-black text-slate-950">Profile</h1>
          <p className="mt-2 text-sm text-slate-500">{profile?.email}</p>

          <label className="mt-5 block">
            <span className="text-sm font-black text-slate-700">Full name</span>
            <input className="brand-focus mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-black text-slate-700">Mobile</span>
            <input className="brand-focus mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm" value={mobile} onChange={(event) => setMobile(event.target.value)} />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-black text-slate-700">Role</span>
            <select className="brand-focus mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              <option value="user">User</option>
              <option value="owner">Owner</option>
              <option value="delivery">Delivery</option>
            </select>
          </label>

          {saved && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Profile saved locally for this Firebase account.</p>}
          <button className="brand-focus mt-5 rounded-lg bg-[#f04423] px-4 py-3 text-sm font-black text-white">Save profile</button>
        </form>
      </main>
    </ProtectedPage>
  );
}
