"use client";

import { useState, useEffect } from "react";
import api from "../api";
import { Plus, Trash2, Edit, X, Check, ChevronDown } from "lucide-react";

export default function CargosPage() {
  const [items, setItems] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("new");
  const [formData, setFormData] = useState({ name: "" });
  const [editingId, setEditingId] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const res = await api.get("/cargos/");
    setItems(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    let targetId = selectedCategoryId;
    try {
      if (editingId) {
        await api.put(`/cargos/${editingId}`, { name: formData.name });
        targetId = editingId;
      } else if (selectedCategoryId === "new") {
        const res = await api.post("/cargos/", { name: formData.name });
        targetId = res.data.id;
      }
      if (selectedImages.length > 0 && targetId && targetId !== "new") {
        for (let img of selectedImages) {
          const fd = new FormData();
          fd.append("file", img);
          await api.post(`/cargos/${targetId}/images`, fd);
        }
      }
      setFormData({ name: "" });
      setEditingId(null);
      setSelectedCategoryId("new");
      setSelectedImages([]);
      setShowForm(false);
      const fileInput = document.getElementById("cargo-images-input");
      if (fileInput) fileInput.value = "";
      fetchItems();
          } catch (error) {
      alert("An error occurred: " + (error.response?.data?.detail || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this entire category and its images?")) {
      await api.delete(`/cargos/${id}`);
      fetchItems();
          }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ name: item.name });
    setShowForm(true);
  };

  const handleDeleteImage = async (imageId) => {
    if (confirm("Delete image?")) {
      await api.delete(`/cargos/images/${imageId}`);
      fetchItems();
          }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: "" });
    setSelectedCategoryId("new");
    setSelectedImages([]);
    setShowForm(false);
  };

  return (
    <section className="relative bg-[#f5f4f0] font-sans flex flex-col p-4 sm:p-5 gap-3 min-h-screen">

      {/* ── HEADER CARD ── */}
      <div className="relative rounded-2xl overflow-hidden bg-white px-6 py-8 sm:px-10 sm:py-10 flex items-end justify-between">
        <div className="absolute top-0 left-0 bg-[#f5f4f0] px-5 py-3 rounded-br-2xl">
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
            Cargo Management
          </span>
        </div>
        <div className="absolute top-0 right-0 bg-[#f5f4f0] px-5 py-3 rounded-bl-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] font-medium text-neutral-900 tracking-tight">
            {items.length} categories
          </span>
        </div>
        <div className="mt-8">
          <h1 className="text-3xl sm:text-[2.6rem] font-bold tracking-[-0.03em] leading-[1.1]">
            Cargo<br />
            <span style={{ color: "#85660c" }} className="italic font-normal">Categories</span>
          </h1>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: "" }); setSelectedCategoryId("new"); }}
          className="flex items-center gap-2 text-[12px] font-semibold px-5 py-2.5 rounded-full transition-colors shrink-0"
          style={{ background: "#85660c", color: "#fff" }}
        >
          <Plus size={14} />
          Add Cargo
        </button>
      </div>

      {/* ── FORM CARD ── */}
      {showForm && (
        <div className="relative rounded-2xl overflow-hidden bg-white">
          <div className="absolute top-0 left-0 bg-[#f5f4f0] px-5 py-3 rounded-br-2xl">
            <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
              {editingId ? "Editing category" : "New category"}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="px-7 pt-14 pb-7 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

              {/* Category selector */}
              {!editingId && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                    Target
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 outline-none border border-transparent focus:border-neutral-300 transition-colors pr-9"
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                    >
                      <option value="new">+ Create New</option>
                      {items.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Category name */}
              {(selectedCategoryId === "new" || editingId) && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hazardous Goods"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
                  />
                </div>
              )}

              {/* Images */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                  Images
                </label>
                <label className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm text-neutral-400 cursor-pointer border border-dashed border-neutral-300 hover:border-neutral-400 transition-colors flex items-center gap-2">
                  <Plus size={13} className="text-neutral-400 shrink-0" />
                  Choose images
                  <input
                    id="cargo-images-input"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setSelectedImages(Array.from(e.target.files))}
                  />
                </label>
                {selectedImages.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {selectedImages.map((file, i) => (
                      <div key={i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-neutral-200">
                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setSelectedImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <X size={8} className="text-white" />
                        </button>
                      </div>
                    ))}
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
                    {editingId ? "Update" : "Save Category"}
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
          <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-300">No categories yet</p>
          <p className="text-sm text-neutral-400">Create your first cargo category above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item, i) => (
            <div key={item.id} className="relative rounded-2xl overflow-hidden bg-white flex flex-col group">

              {/* Corner index */}
              <div className="absolute top-0 left-0 bg-[#f5f4f0] px-4 py-2.5 rounded-br-2xl z-10">
                <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Action buttons */}
              <div className="absolute bottom-0 right-0 bg-[#f5f4f0] px-3 py-2 rounded-tl-2xl z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

              {/* Image grid */}
              {item.images && item.images.length > 0 ? (
                <div className={`grid gap-0.5 ${item.images.length === 1 ? "grid-cols-1" : item.images.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                  {item.images.map((img) => (
                    <div key={img.id} className="relative aspect-square group/img">
                      <img
                        src={img.image_url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors" />
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-red-500 rounded-full flex items-center justify-center shadow-sm border border-black/5 transition-colors group/btn"
                      >
                        <X size={12} className="text-red-500 group-hover/btn:text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 bg-[#f5f4f0] flex items-center justify-center mt-10">
                  <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-300">No images</p>
                </div>
              )}

              {/* Body */}
              <div className="flex flex-col gap-2 p-5">
                <div className="w-6 h-0.5 rounded-full" style={{ background: "#85660c" }} />
                <h3 className="text-lg font-bold tracking-[-0.02em] text-neutral-900 leading-tight">
                  {item.name}
                </h3>
                <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-neutral-400">
                  {item.images?.length || 0} image{item.images?.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}