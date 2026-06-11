"use client";

import { useState, useEffect } from "react";
import api from "../api";
import { Plus, Trash2, Edit, X, Check, FileText, ExternalLink, Calendar } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CircularsPage() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ title: "", description: "", circular_name: "", date: "" });
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const res = await api.get("/circulars/");
    setItems(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let savedItem;
      if (editingId) {
        const res = await api.put(`/circulars/${editingId}`, formData);
        savedItem = res.data;
      } else {
        const res = await api.post("/circulars/", formData);
        savedItem = res.data;
      }
      if (selectedFile) {
        const fd = new FormData();
        fd.append("file", selectedFile);
        await api.post(`/circulars/${savedItem.id}/pdf`, fd);
      }
      setFormData({ title: "", description: "", circular_name: "", date: "" });
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
      await api.delete(`/circulars/${id}`);
      fetchItems();
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description,
      circular_name: item.circular_name || "",
      date: item.date || "",
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: "", description: "", circular_name: "", date: "" });
    setSelectedFile(null);
    setShowForm(false);
  };

  return (
    <section className="relative bg-[#f5f4f0] font-sans flex flex-col p-4 sm:p-5 gap-3 min-h-screen">

      {/* ── HEADER CARD ── */}
      <div className="relative rounded-2xl overflow-hidden bg-white px-6 py-8 sm:px-10 sm:py-10 flex items-end justify-between">
        <div className="absolute top-0 left-0 bg-[#f5f4f0] px-5 py-3 rounded-br-2xl">
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
            Documents
          </span>
        </div>
        <div className="absolute top-0 right-0 bg-[#f5f4f0] px-5 py-3 rounded-bl-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] font-medium text-neutral-900 tracking-tight">
            {items.length} circulars
          </span>
        </div>
        <div className="mt-8">
          <h1 className="text-3xl sm:text-[2.6rem] font-bold tracking-[-0.03em] leading-[1.1]">
            Company<br />
            <span style={{ color: "#85660c" }} className="italic font-normal">Circulars</span>
          </h1>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ title: "", description: "", circular_name: "", date: "" }); }}
          className="flex items-center gap-2 text-[12px] font-semibold px-5 py-2.5 rounded-full transition-colors shrink-0"
          style={{ background: "#85660c", color: "#fff" }}
        >
          <Plus size={14} />
          Add Circular
        </button>
      </div>

      {/* ── FORM CARD ── */}
      {showForm && (
        <div className="relative rounded-2xl overflow-hidden bg-white">
          <div className="absolute top-0 left-0 bg-[#f5f4f0] px-5 py-3 rounded-br-2xl">
            <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
              {editingId ? "Editing circular" : "New circular"}
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
                  placeholder="e.g. Q2 2025 Trade Notice"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
                />
              </div>

              {/* Circular Name / Reference */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                  Circular Name / Reference No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. CIR/2025/001"
                  value={formData.circular_name}
                  onChange={(e) => setFormData({ ...formData, circular_name: e.target.value })}
                  className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 outline-none border border-transparent focus:border-neutral-300 transition-colors"
                />
              </div>

              {/* Document upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                  Document (PDF)
                </label>
                {!selectedFile ? (
                  <label className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm text-neutral-400 cursor-pointer border border-dashed border-neutral-300 hover:border-neutral-400 transition-colors flex items-center gap-2">
                    <Plus size={13} className="text-neutral-400 shrink-0" />
                    Choose PDF document
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                  </label>
                ) : (
                  <div className="relative w-full h-16 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 flex items-center px-4">
                    <FileText size={20} className="text-red-500 mr-3 shrink-0" />
                    <span className="text-sm font-medium text-neutral-900 truncate flex-1">{selectedFile.name}</span>
                    <button type="button" onClick={() => setSelectedFile(null)} className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                Description
              </label>
              <textarea
                required
                rows={3}
                placeholder="Brief description of this circular..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors resize-none"
              />
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
                    {editingId ? "Update" : "Save Circular"}
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
          <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-300">No circulars yet</p>
          <p className="text-sm text-neutral-400">Add your first circular document above</p>
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

              {/* PDF preview banner */}
              {item.pdf_url ? (
                <div className="h-48 overflow-hidden mt-10 mx-4 rounded-xl border border-neutral-200 relative bg-neutral-100">
                  <iframe
                    src={`${item.pdf_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    className="w-full h-[150%] -mt-8 pointer-events-none"
                    title={item.title}
                  />
                  <div className="absolute inset-0 z-10" />
                </div>
              ) : (
                <div
                  className="h-28 flex items-center justify-center mt-10 mx-4 rounded-xl"
                  style={{ background: "rgba(133,102,12,0.06)", border: "1px dashed rgba(133,102,12,0.2)" }}
                >
                  <FileText size={32} style={{ color: "rgba(133,102,12,0.4)" }} />
                </div>
              )}

              {/* Body */}
              <div className="flex flex-col gap-3 p-5 flex-1">
                <div className="w-6 h-0.5 rounded-full" style={{ background: "#85660c" }} />

                {/* Circular name badge + date row */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {item.circular_name && (
                    <span
                      className="text-[10px] font-semibold tracking-[0.1em] uppercase px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(133,102,12,0.08)", color: "#85660c" }}
                    >
                      {item.circular_name}
                    </span>
                  )}
                  {item.date && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-neutral-400">
                      <Calendar size={10} />
                      {formatDate(item.date)}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold tracking-[-0.02em] text-neutral-900 leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed flex-1">
                  {item.description}
                </p>
              </div>

              {/* Bottom — view PDF */}
              <div className="px-5 pb-5">
                <a
                  href={item.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors"
                  style={{ background: "rgba(133,102,12,0.08)", color: "#85660c" }}
                >
                  View Document
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
