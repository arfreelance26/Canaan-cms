"use client";

import { useState, useEffect } from "react";
import api from "../api";
import { Mail, Phone, Trash2, ChevronDown, Circle } from "lucide-react";

const TYPE_FIELD_LABELS = {
  Shipping: [
    ["company_name", "Company Name"],
    ["shipping_mode", "Trade Type"],
    ["port_of_loading", "Port of Loading"],
    ["port_of_discharge", "Port of Discharge"],
    ["container_type", "Container Type & Size"],
    ["weight", "Weight"],
    ["factory_location", "Factory Location"],
  ],
  Transportation: [
    ["transport_export_import", "Trade Type"],
    ["pickup_location", "Pickup"],
    ["delivery_location", "Delivery"],
    ["transport_cargo_type", "Type of Cargo"],
    ["container_type", "Container Type"],
    ["weight", "Weight"],
  ],
  "RFID Seals": [
    ["quantity", "Quantity Required"],
    ["rfid_org_name", "Organisation Name"],
  ],
};

const FILTERS = ["All", "Shipping", "Transportation", "RFID Seals"];

export default function MessagesPage() {
  const [items, setItems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [selectedIds, setSelectedIds] = useState(new Set());

  const fetchItems = async () => {
    const res = await api.get("/contact/");
    setItems(res.data);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect -- setState happens after an await inside fetchItems, not synchronously in the effect body
  useEffect(() => { fetchItems(); }, []);

  const handleExpand = async (item) => {
    const isOpening = expandedId !== item.id;
    setExpandedId(isOpening ? item.id : null);
    if (isOpening && !item.is_read) {
      const res = await api.put(`/contact/${item.id}/read`);
      setItems((prev) => prev.map((m) => (m.id === item.id ? res.data : m)));
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this message?")) {
      await api.delete(`/contact/${id}`);
      fetchItems();
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const allSelected = filteredItems.length > 0 && filteredItems.every((m) => prev.has(m.id));
      if (allSelected) {
        const next = new Set(prev);
        filteredItems.forEach((m) => next.delete(m.id));
        return next;
      }
      return new Set([...prev, ...filteredItems.map((m) => m.id)]);
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected message${selectedIds.size > 1 ? "s" : ""}?`)) return;
    await api.post("/contact/bulk-delete", { ids: Array.from(selectedIds) });
    setSelectedIds(new Set());
    fetchItems();
  };

  const unreadCount = items.filter((m) => !m.is_read).length;
  const filteredItems = filterType === "All" ? items : items.filter((m) => m.inquiry_type === filterType);
  const allFilteredSelected = filteredItems.length > 0 && filteredItems.every((m) => selectedIds.has(m.id));

  return (
    <section className="relative bg-[#f5f4f0] font-sans flex flex-col p-4 sm:p-5 gap-3 min-h-screen">

      {/* ── HEADER CARD ── */}
      <div className="relative rounded-2xl overflow-hidden bg-white px-6 py-8 sm:px-10 sm:py-10 flex items-end justify-between">
        <div className="absolute top-0 left-0 bg-[#f5f4f0] px-5 py-3 rounded-br-2xl">
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
            Inquiries
          </span>
        </div>
        <div className="absolute top-0 right-0 bg-[#f5f4f0] px-5 py-3 rounded-bl-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] font-medium text-neutral-900 tracking-tight">
            {items.length} messages{unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
          </span>
        </div>
        <div className="mt-8">
          <h1 className="text-3xl sm:text-[2.6rem] font-bold tracking-[-0.03em] leading-[1.1]">
            Contact
            <span style={{ color: "#85660c" }} className="italic font-normal"> Messages</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-2 max-w-lg leading-relaxed">
            Inquiries submitted through the website&apos;s contact form.
          </p>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      {items.length > 0 && (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map((type) => {
              const count = type === "All" ? items.length : items.filter((m) => m.inquiry_type === type).length;
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`text-[11px] font-semibold px-4 py-2 rounded-full transition-colors ${
                    filterType === type ? "text-white" : "bg-white text-neutral-500 hover:text-neutral-900"
                  }`}
                  style={filterType === type ? { background: "#85660c" } : {}}
                >
                  {type} <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAll}
                className="w-3.5 h-3.5 accent-[#85660c]"
              />
              Select all
            </label>
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-red-500 hover:text-red-600 bg-red-50 px-3 py-1.5 rounded-full"
              >
                <Trash2 size={12} /> Delete {selectedIds.size} selected
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── MESSAGES LIST ── */}
      {items.length === 0 ? (
        <div className="rounded-2xl bg-white flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-300">No messages yet</p>
          <p className="text-sm text-neutral-400">Submissions from the contact form will appear here</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl bg-white flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-sm text-neutral-400">No {filterType} messages</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredItems.map((item) => {
            const isOpen = expandedId === item.id;
            const typeFields = TYPE_FIELD_LABELS[item.inquiry_type] || [];
            return (
              <div
                key={item.id}
                className={`rounded-2xl overflow-hidden border-l-[3px] ${
                  item.is_read
                    ? "bg-white border-l-transparent border border-black/[0.06]"
                    : "border border-black/[0.06]"
                }`}
                style={!item.is_read ? { background: "rgba(133,102,12,0.05)", borderLeftColor: "#85660c" } : {}}
              >
                <div className="w-full flex items-center gap-3 px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelect(item.id)}
                    className="w-3.5 h-3.5 accent-[#85660c] shrink-0"
                  />
                  <button
                    onClick={() => handleExpand(item)}
                    className="flex-1 min-w-0 flex items-center gap-3 text-left"
                  >
                  {!item.is_read && (
                    <Circle size={8} fill="#85660c" className="text-[#85660c] shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm tracking-tight truncate ${item.is_read ? "font-medium text-neutral-500" : "font-bold text-neutral-900"}`}>
                        {item.name}
                      </p>
                      <span
                        className="text-[9px] font-semibold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: "rgba(133,102,12,0.08)", color: "#85660c" }}
                      >
                        {item.inquiry_type}
                      </span>
                      {!item.is_read && (
                        <span className="text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full shrink-0 text-white" style={{ background: "#85660c" }}>
                          New
                        </span>
                      )}
                    </div>
                    <p className={`text-[12px] truncate mt-0.5 ${item.is_read ? "text-neutral-400" : "text-neutral-600"}`}>{item.email}</p>
                  </div>
                  <p className="text-[11px] text-neutral-400 shrink-0 hidden sm:block">
                    {new Date(item.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  <ChevronDown size={16} className={`text-neutral-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-black/[0.06] pt-4 flex flex-col gap-4">
                    <div className="flex flex-wrap gap-4">
                      <a href={`mailto:${item.email}`} className="flex items-center gap-1.5 text-[12px] text-neutral-600 hover:text-neutral-900">
                        <Mail size={13} /> {item.email}
                      </a>
                      {item.phone && (
                        <a href={`tel:${item.phone}`} className="flex items-center gap-1.5 text-[12px] text-neutral-600 hover:text-neutral-900">
                          <Phone size={13} /> {item.phone}
                        </a>
                      )}
                    </div>

                    {typeFields.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#f5f4f0] rounded-xl p-4">
                        {typeFields.map(([key, label]) => (
                          item[key] ? (
                            <div key={key}>
                              <p className="text-[9px] font-medium tracking-[0.1em] uppercase text-neutral-400">{label}</p>
                              <p className="text-[13px] text-neutral-900 font-medium mt-0.5">{item[key]}</p>
                            </div>
                          ) : null
                        ))}
                      </div>
                    )}

                    {item.message && (
                      <div>
                        <p className="text-[9px] font-medium tracking-[0.1em] uppercase text-neutral-400 mb-1">Message</p>
                        <p className="text-sm text-neutral-700 leading-relaxed">{item.message}</p>
                      </div>
                    )}

                    <div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
