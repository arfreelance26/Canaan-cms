"use client";

import { useState, useEffect } from "react";
import api from "../api";
import { Check, Video as VideoIcon, X, Plus, AlertCircle } from "lucide-react";

const MAX_SIZE = 40 * 1024 * 1024;

export default function HeroVideoPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchItem = async () => {
    try {
      const res = await api.get("/hero-video/");
      setCurrentVideo(res.data.video_url);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- setState happens after an await inside fetchItem, not synchronously in the effect body
    fetchItem();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError(null);

    if (file.type !== "video/mp4") {
      setError("Only MP4 videos are allowed.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File too large. Maximum 40MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      await api.post(`/hero-video/content`, fd);
      setSelectedFile(null);

      setCurrentVideo(currentVideo ? `${currentVideo.split('?')[0]}?t=${new Date().getTime()}` : null);
      fetchItem();
    } catch (err) {
      setError(err?.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="relative bg-[#f5f4f0] font-sans flex flex-col p-4 sm:p-5 gap-3 min-h-screen">
      <div className="relative rounded-2xl overflow-hidden bg-white px-6 py-8 sm:px-10 sm:py-10 flex flex-col gap-4 max-w-3xl">
        <div className="absolute top-0 left-0 bg-[#f5f4f0] px-5 py-3 rounded-br-2xl">
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
            Homepage
          </span>
        </div>

        <div className="mt-8">
          <h1 className="text-3xl sm:text-[2.6rem] font-bold tracking-[-0.03em] leading-[1.1]">
            Hero
            <span style={{ color: "#85660c" }} className="italic font-normal"> Promo Video</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-2 max-w-lg leading-relaxed">
            Upload the promotional video shown in the hero section of the main website. MP4 only, maximum 40MB.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
              Current Video
            </label>
            {currentVideo ? (
              <video
                key={currentVideo}
                src={currentVideo}
                controls
                className="w-full max-w-md rounded-2xl border border-neutral-200 bg-black"
              />
            ) : (
              <div className="w-full max-w-md h-48 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center">
                <VideoIcon className="text-neutral-300" size={32} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
              Upload New Video
            </label>
            {!selectedFile ? (
              <label className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm text-neutral-400 cursor-pointer border border-dashed border-neutral-300 hover:border-neutral-400 transition-colors flex items-center gap-2 max-w-md">
                <Plus size={13} className="text-neutral-400 shrink-0" />
                Choose MP4 video
                <input
                  type="file"
                  accept="video/mp4"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="relative w-full max-w-md h-12 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 flex items-center justify-between px-3">
                <span className="text-[12px] font-medium text-neutral-700 truncate max-w-[80%]">{selectedFile.name}</span>
                <button type="button" onClick={() => setSelectedFile(null)} className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                  <X size={10} className="text-white" />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-[12px] text-red-600 max-w-md">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

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
                  Upload Video
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
