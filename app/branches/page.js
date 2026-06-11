"use client";

import { useState, useEffect } from "react";
import api from "../api";
import { Plus, Trash2, Edit, X, Check, MapPin } from "lucide-react";

function SafeMapEmbed({ iframeHtml }) {
  const match = iframeHtml?.match(/src=["']([^"']+)["']/);
  if (!match) return null;
  return (
    <iframe
      src={match[1]}
      className="w-full h-32 mt-2 rounded-xl border border-neutral-200"
      loading="lazy"
      referrerPolicy="no-referrer"
      sandbox="allow-scripts allow-same-origin"
      title="Branch location map"
    />
  );
}

export default function BranchesPage() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ title: "", address: "", iframe_input: "" });
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const res = await api.get("/branches/");
    setItems(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let savedItem;
    if (editingId) {
      const res = await api.put(`/branches/${editingId}`, formData);
      savedItem = res.data;
    } else {
      const res = await api.post("/branches/", formData);
      savedItem = res.data;
    }
    if (selectedFile) {
      const fd = new FormData();
      fd.append("file", selectedFile);
      await api.post(`/branches/${savedItem.id}/image`, fd);
    }
    setFormData({ title: "", address: "", iframe_input: "" });
    setEditingId(null);
    setSelectedFile(null);
    setShowForm(false);
    fetchItems();
        } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure?")) {
      await api.delete(`/branches/${id}`);
      fetchItems();
          }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ title: item.title, address: item.address, iframe_input: item.iframe_input });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: "", address: "", iframe_input: "" });
    setSelectedFile(null);
    setShowForm(false);
  };

  return (
    <section className="relative bg-[#f5f4f0] font-sans flex flex-col p-4 sm:p-5 gap-3 min-h-screen">

      {/* ── HEADER CARD ── */}
      <div className="relative rounded-2xl overflow-hidden bg-white px-6 py-8 sm:px-10 sm:py-10 flex items-end justify-between">
        <div className="absolute top-0 left-0 bg-[#f5f4f0] px-5 py-3 rounded-br-2xl">
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
            Locations
          </span>
        </div>
        <div className="absolute top-0 right-0 bg-[#f5f4f0] px-5 py-3 rounded-bl-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] font-medium text-neutral-900 tracking-tight">
            {items.length} branches
          </span>
        </div>
        <div className="mt-8">
          <h1 className="text-3xl sm:text-[2.6rem] font-bold tracking-[-0.03em] leading-[1.1]">
            Our
             <span style={{ color: "#85660c" }} className="italic font-normal"> Branches</span>
          </h1>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ title: "", address: "", iframe_input: "" }); }}
          className="flex items-center gap-2 text-[12px] font-semibold px-5 py-2.5 rounded-full transition-colors shrink-0"
          style={{ background: "#85660c", color: "#fff" }}
        >
          <Plus size={14} />
          Add Branch
        </button>
      </div>

      {/* ── FORM CARD ── */}
      {showForm && (
        <div className="relative rounded-2xl overflow-hidden bg-white">
          <div className="absolute top-0 left-0 bg-[#f5f4f0] px-5 py-3 rounded-br-2xl">
            <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
              {editingId ? "Editing branch" : "New branch"}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="px-7 pt-14 pb-7 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dubai Headquarters"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
                />
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                  Address
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Full physical address..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Google Map Iframe */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                  Google Maps Embed Iframe
                </label>
                <input
                  type="text"
                  required
                  placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ></iframe>'
                  value={formData.iframe_input}
                  onChange={(e) => setFormData({ ...formData, iframe_input: e.target.value })}
                  className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
                />
              </div>

              {/* Image upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                  Branch Image
                </label>
                {!selectedFile ? (
                  <label className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm text-neutral-400 cursor-pointer border border-dashed border-neutral-300 hover:border-neutral-400 transition-colors flex items-center gap-2">
                    <Plus size={13} className="text-neutral-400 shrink-0" />
                    Choose image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                  </label>
                ) : (
                  <div className="relative w-full h-16 rounded-xl overflow-hidden border border-neutral-200">
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-between px-3">
                      <span className="text-[10px] font-medium text-white truncate max-w-[80%]">{selectedFile.name}</span>
                      <button type="button" onClick={() => setSelectedFile(null)} className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex items-center gap-2 text-[12px] font-semibold px-5 py-2.5 rounded-full text-white transition-colors ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{ background: "#85660c" }}
              >
                {isSaving ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    {editingId ? "Update" : "Save Branch"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 text-[12px] font-semibold px-5 py-2.5 rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
              >
                <X size={13} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── GRID ── */}
      {items.length === 0 ? (
        <div className="rounded-2xl bg-white flex flex-col items-center justify-center py-20 gap-3">
          <MapPin size={28} className="text-neutral-200" />
          <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-300">No branches yet</p>
          <p className="text-sm text-neutral-400">Add your first branch location above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item, i) => (
            <div key={item.id} className="relative rounded-2xl overflow-hidden bg-white flex flex-col group">

              {/* Corner index */}
              <div className="absolute top-0 left-0 bg-[#f5f4f0] px-4 py-2.5 rounded-br-2xl z-10">
                <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Action buttons */}
              <div className="absolute top-0 right-0 bg-[#f5f4f0] px-3 py-2 rounded-bl-2xl z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(item)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-200 transition-colors"
                >
                  <Edit size={12} className="text-neutral-500" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={12} className="text-red-400" />
                </button>
              </div>

              {/* Branch image */}
              {item.image_url ? (
                <div className="relative h-48 overflow-hidden bg-neutral-100">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.parentElement.style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                     <h3 className="text-xl font-bold tracking-tight leading-tight">{item.title}</h3>
                  </div>
                </div>
              ) : (
                <div
                  className="h-48 flex flex-col items-start justify-end p-4"
                  style={{ background: "rgba(133,102,12,0.06)", borderBottom: "1px solid rgba(133,102,12,0.2)" }}
                >
                  <h3 className="text-xl font-bold tracking-tight leading-tight text-neutral-900">{item.title}</h3>
                </div>
              )}

              {/* Body */}
              <div className="flex flex-col gap-3 p-5 flex-1">
                <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-neutral-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-neutral-500 leading-relaxed flex-1">
                        {item.address}
                    </p>
                </div>
                
                {/* Embedded Map */}
                <SafeMapEmbed iframeHtml={item.iframe_input} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
