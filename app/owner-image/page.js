"use client";

import { useState, useEffect } from "react";
import api from "../api";
import { Check, Image as ImageIcon, X, Plus } from "lucide-react";

export default function OwnerImagePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchItem();
  }, []);

  const fetchItem = async () => {
    try {
      const res = await api.get("/owner-image/");
      setCurrentImage(res.data.image_url);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      await api.post(`/owner-image/content`, fd);
      setSelectedFile(null);
      
      // Cache buster for the image preview
      setCurrentImage(currentImage ? `${currentImage.split('?')[0]}?t=${new Date().getTime()}` : null);
      fetchItem();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="relative bg-[#f5f4f0] font-sans flex flex-col p-4 sm:p-5 gap-3 min-h-screen">
      <div className="relative rounded-2xl overflow-hidden bg-white px-6 py-8 sm:px-10 sm:py-10 flex flex-col gap-4 max-w-3xl">
        <div className="absolute top-0 left-0 bg-[#f5f4f0] px-5 py-3 rounded-br-2xl">
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
            Profile
          </span>
        </div>
        
        <div className="mt-8">
          <h1 className="text-3xl sm:text-[2.6rem] font-bold tracking-[-0.03em] leading-[1.1]">
            Owner
            <span style={{ color: "#85660c" }} className="italic font-normal"> Image</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-2 max-w-lg leading-relaxed">
            Update the owner's profile picture displayed on the site.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
              Current Image
            </label>
            {currentImage ? (
               <div className="relative w-48 h-48 rounded-2xl overflow-hidden border border-neutral-200">
                 <img src={currentImage} alt="Owner" className="w-full h-full object-cover" />
               </div>
            ) : (
               <div className="w-48 h-48 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center">
                 <ImageIcon className="text-neutral-300" size={32} />
               </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
              Upload New Image
            </label>
            {!selectedFile ? (
              <label className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm text-neutral-400 cursor-pointer border border-dashed border-neutral-300 hover:border-neutral-400 transition-colors flex items-center gap-2 max-w-md">
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
              <div className="relative w-full max-w-md h-16 rounded-xl overflow-hidden border border-neutral-200">
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

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving || !selectedFile}
              className={`flex items-center gap-2 text-[12px] font-semibold px-5 py-2.5 rounded-full text-white transition-colors ${isSaving || !selectedFile ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{ background: "#85660c" }}
            >
              {isSaving ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check size={13} />
                  Upload Image
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
