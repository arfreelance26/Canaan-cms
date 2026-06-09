"use client";

import { useState, useEffect } from "react";
import api from "../api";
import { Plus, Trash2, Edit, X, Check, Users, Mail } from "lucide-react";

export default function TeamsPage() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ name: "", designation: "", email: "" });
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const res = await api.get("/teams/");
    setItems(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let savedItem;
    if (editingId) {
      const res = await api.put(`/teams/${editingId}`, formData);
      savedItem = res.data;
    } else {
      const res = await api.post("/teams/", formData);
      savedItem = res.data;
    }
    if (selectedFile) {
      const fd = new FormData();
      fd.append("file", selectedFile);
      await api.post(`/teams/${savedItem.id}/image`, fd);
    }
    setFormData({ name: "", designation: "", email: "" });
    setEditingId(null);
    setSelectedFile(null);
    setShowForm(false);
    fetchItems();
    window.location.reload();
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure?")) {
      await api.delete(`/teams/${id}`);
      fetchItems();
      window.location.reload();
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ name: item.name, designation: item.designation, email: item.email });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: "", designation: "", email: "" });
    setSelectedFile(null);
    setShowForm(false);
  };

  return (
    <section className="relative bg-[#f5f4f0] font-sans flex flex-col p-4 sm:p-5 gap-3 min-h-screen">

      {/* ── HEADER CARD ── */}
      <div className="relative rounded-2xl overflow-hidden bg-white px-6 py-8 sm:px-10 sm:py-10 flex items-end justify-between">
        <div className="absolute top-0 left-0 bg-[#f5f4f0] px-5 py-3 rounded-br-2xl">
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
            People
          </span>
        </div>
        <div className="absolute top-0 right-0 bg-[#f5f4f0] px-5 py-3 rounded-bl-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] font-medium text-neutral-900 tracking-tight">
            {items.length} members
          </span>
        </div>
        <div className="mt-8">
          <h1 className="text-3xl sm:text-[2.6rem] font-bold tracking-[-0.03em] leading-[1.1]">
            Our
            <span style={{ color: "#85660c" }} className="italic font-normal"> Team</span>
          </h1>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: "", designation: "", email: "" }); }}
          className="flex items-center gap-2 text-[12px] font-semibold px-5 py-2.5 rounded-full transition-colors shrink-0"
          style={{ background: "#85660c", color: "#fff" }}
        >
          <Plus size={14} />
          Add Member
        </button>
      </div>

      {/* ── FORM CARD ── */}
      {showForm && (
        <div className="relative rounded-2xl overflow-hidden bg-white">
          <div className="absolute top-0 left-0 bg-[#f5f4f0] px-5 py-3 rounded-br-2xl">
            <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
              {editingId ? "Editing member" : "New member"}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="px-7 pt-14 pb-7 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
                />
              </div>

              {/* Designation */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                  Designation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operations Manager"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@canaan.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
                />
              </div>

              {/* Image upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                  Profile Image
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
                className="flex items-center gap-2 text-[12px] font-semibold px-5 py-2.5 rounded-full text-white transition-colors"
                style={{ background: "#85660c" }}
              >
                <Check size={13} />
                {editingId ? "Update" : "Save Member"}
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
          <Users size={28} className="text-neutral-200" />
          <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-300">No members yet</p>
          <p className="text-sm text-neutral-400">Add your first team member above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

              {/* Photo */}
              {item.image_url ? (
                <div className="relative h-52 mt-10 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
                </div>
              ) : (
                <div
                  className="h-52 mt-10 flex items-center justify-center"
                  style={{ background: "rgba(133,102,12,0.06)" }}
                >
                  <Users size={32} style={{ color: "rgba(133,102,12,0.35)" }} />
                </div>
              )}

              {/* Body */}
              <div className="flex flex-col gap-2 p-5 flex-1">
                <div className="w-6 h-0.5 rounded-full" style={{ background: "#85660c" }} />
                <h3 className="text-base font-bold tracking-[-0.02em] text-neutral-900 leading-tight">
                  {item.name}
                </h3>
                <p
                  className="text-[10px] font-semibold tracking-[0.1em] uppercase"
                  style={{ color: "#85660c" }}
                >
                  {item.designation}
                </p>
              </div>

              {/* Bottom — email */}
              <div className="px-5 pb-5">
<a
                href={`mailto:${item.email}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-medium tracking-tight text-neutral-500 hover:text-neutral-900 transition-colors truncate"
                style={{ background: "rgba(0,0,0,0.04)" }}
                >
                <Mail size={11} className="shrink-0 text-neutral-400" />
                {item.email}
              </a>
            </div>
            </div>
      ))}
    </div>
  )
}
    </section >
  );
}