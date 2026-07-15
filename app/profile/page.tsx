"use client";

import { FormEvent, useState } from "react";
import { ProtectedPage } from "@/components/protected-page";
import { useRasoiGo } from "@/components/app-provider";

const roleLabels = {
  user: "User",
  owner: "Restaurant Owner",
  delivery: "Delivery Partner",
  admin: "Admin"
};

export default function ProfilePage() {
  const { profile, updateUserProfile } = useRasoiGo();
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [mobile, setMobile] = useState(profile?.mobile || "");
  const [saved, setSaved] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateUserProfile({ fullName, mobile });
    setSaved(true);
  };

  return (
    <ProtectedPage>
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <form className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm" onSubmit={submit}>
          <h1 className="text-3xl font-black text-slate-950">Profile</h1>
          <p className="mt-2 text-sm text-slate-500">{profile?.email}</p>
          {profile?.createdAt && (
            <div className="mt-4 rounded-lg bg-orange-50 px-3 py-3 text-sm font-bold text-slate-700">
              Signed up on {new Date(profile.createdAt).toLocaleString()}
            </div>
          )}

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
            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-black text-slate-700">
              {profile ? roleLabels[profile.role] : "User"}
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Role is fixed after signup. Only Admin can change account roles.
            </p>
          </label>

          {saved && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Profile saved locally for this Firebase account.</p>}
          <button className="brand-focus mt-5 rounded-lg bg-[#f04423] px-4 py-3 text-sm font-black text-white">Save profile</button>
        </form>
      </main>
    </ProtectedPage>
  );
}
