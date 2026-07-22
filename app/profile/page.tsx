"use client";

import { FormEvent, useState } from "react";
import { ProtectedPage } from "@/components/protected-page";
import { useRasoiGo } from "@/components/app-provider";
import type { SupportLog } from "@/lib/types";

const roleLabels = {
  user: "User",
  owner: "Restaurant Owner",
  delivery: "Delivery Partner",
  admin: "Admin"
};

export default function ProfilePage() {
  const { data, profile, updateUserProfile, createSupportTicket } = useRasoiGo();
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [mobile, setMobile] = useState(profile?.mobile || "");
  const [saved, setSaved] = useState(false);
  const [ticketSaved, setTicketSaved] = useState(false);
  const [ticketDraft, setTicketDraft] = useState({
    orderId: "",
    category: "order" as SupportLog["category"],
    priority: "medium" as SupportLog["priority"],
    subject: "",
    message: ""
  });
  const userOrders = profile ? data.orders.filter((order) => order.userId === profile.uid) : [];
  const userTickets = profile
    ? data.supportLogs
        .filter((ticket) => ticket.userId === profile.uid)
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    : [];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateUserProfile({ fullName, mobile });
    setSaved(true);
  };
  const submitTicket = () => {
    if (!ticketDraft.subject.trim() || !ticketDraft.message.trim()) return;
    createSupportTicket({
      orderId: ticketDraft.orderId || undefined,
      category: ticketDraft.category,
      priority: ticketDraft.priority,
      subject: ticketDraft.subject.trim(),
      message: ticketDraft.message.trim()
    });
    setTicketDraft((current) => ({ ...current, orderId: "", subject: "", message: "" }));
    setTicketSaved(true);
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

        {profile?.role === "user" && (
          <section className="mt-6 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">Support tickets</h2>
            <p className="mt-1 text-sm text-slate-500">Raise order, payment, or delivery complaints and track the response here.</p>

            <div className="mt-5 rounded-lg bg-slate-50 p-4">
              <h3 className="text-lg font-black text-slate-950">Create support ticket</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <select className="brand-focus rounded-lg border border-slate-200 px-3 py-3 text-sm" value={ticketDraft.orderId} onChange={(event) => setTicketDraft((current) => ({ ...current, orderId: event.target.value }))}>
                  <option value="">No linked order</option>
                  {userOrders.map((order) => (
                    <option key={order.id} value={order.id}>{order.id.slice(0, 10)} - Rs {order.total}</option>
                  ))}
                </select>
                <select className="brand-focus rounded-lg border border-slate-200 px-3 py-3 text-sm" value={ticketDraft.category} onChange={(event) => setTicketDraft((current) => ({ ...current, category: event.target.value as SupportLog["category"] }))}>
                  <option value="order">Order complaint</option>
                  <option value="payment">Payment complaint</option>
                  <option value="delivery">Delivery complaint</option>
                </select>
                <select className="brand-focus rounded-lg border border-slate-200 px-3 py-3 text-sm" value={ticketDraft.priority} onChange={(event) => setTicketDraft((current) => ({ ...current, priority: event.target.value as SupportLog["priority"] }))}>
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                  <option value="urgent">Urgent priority</option>
                </select>
                <input className="brand-focus rounded-lg border border-slate-200 px-3 py-3 text-sm" placeholder="Ticket subject" value={ticketDraft.subject} onChange={(event) => setTicketDraft((current) => ({ ...current, subject: event.target.value }))} />
                <textarea className="brand-focus min-h-28 rounded-lg border border-slate-200 px-3 py-3 text-sm md:col-span-2" placeholder="Complaint details" value={ticketDraft.message} onChange={(event) => setTicketDraft((current) => ({ ...current, message: event.target.value }))} />
              </div>
              <button className="brand-focus mt-3 rounded-lg bg-[#f04423] px-4 py-3 text-sm font-black text-white disabled:opacity-50" onClick={submitTicket} disabled={!ticketDraft.subject.trim() || !ticketDraft.message.trim()}>
                Add ticket
              </button>
              {ticketSaved && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">Ticket raised successfully.</p>}
            </div>

            <div className="mt-5 grid gap-3">
              {userTickets.length ? userTickets.map((ticket) => (
                <article key={ticket.id} className="rounded-lg bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-black text-slate-950">{ticket.subject}</h3>
                      <p className="mt-1 text-sm text-slate-500">{ticket.message}</p>
                      {ticket.orderId && <p className="mt-1 text-xs font-bold text-slate-400">Order {ticket.orderId.slice(0, 12)}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-black uppercase">
                      <span className="rounded-md bg-orange-50 px-2 py-1 text-[#f04423]">{ticket.category}</span>
                      <span className="rounded-md bg-white px-2 py-1 text-slate-600">{ticket.priority}</span>
                      <span className="rounded-md bg-white px-2 py-1 text-slate-600">{ticket.status}</span>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {ticket.communications.map((entry) => (
                      <div key={entry.id} className="rounded-lg bg-white p-3 text-sm">
                        <p className="font-black text-slate-950">{entry.fromName} <span className="text-xs uppercase text-slate-400">{entry.fromRole}</span></p>
                        <p className="mt-1 text-slate-500">{entry.message}</p>
                      </div>
                    ))}
                  </div>
                </article>
              )) : <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">No support tickets yet.</p>}
            </div>
          </section>
        )}
      </main>
    </ProtectedPage>
  );
}
