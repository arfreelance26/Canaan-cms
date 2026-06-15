"use client";

import { useState, useEffect } from "react";
import api from "../api";
import { Check, DollarSign } from "lucide-react";

export default function ExchangeRatesPage() {
  const [formData, setFormData] = useState({ usd: "", aed: "", gbp: "", eur: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const res = await api.get("/exchange-rates/");
    setFormData({
      usd: res.data.usd || "",
      aed: res.data.aed || "",
      gbp: res.data.gbp || "",
      eur: res.data.eur || ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put("/exchange-rates/", formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="relative bg-[#f5f4f0] font-sans flex flex-col p-4 sm:p-5 gap-3 min-h-screen">
      <div className="relative rounded-2xl overflow-hidden bg-white px-6 py-8 sm:px-10 sm:py-10 flex flex-col gap-4">
        <div className="absolute top-0 left-0 bg-[#f5f4f0] px-5 py-3 rounded-br-2xl">
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
            Rates
          </span>
        </div>
        
        <div className="mt-8">
          <h1 className="text-3xl sm:text-[2.6rem] font-bold tracking-[-0.03em] leading-[1.1]">
            Customs
            <span style={{ color: "#85660c" }} className="italic font-normal"> Exchange Rates</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-2 max-w-lg leading-relaxed">
            Update the exchange rates for USD, AED, GBP, and EUR. These will be displayed on the public site.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6 max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* AED */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                AED
              </label>
              <input
                type="text"
                placeholder="e.g. 3.67"
                value={formData.aed}
                onChange={(e) => setFormData({ ...formData, aed: e.target.value })}
                className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
              />
            </div>
            
            {/* USD */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                USD
              </label>
              <input
                type="text"
                placeholder="e.g. 98.5"
                value={formData.usd}
                onChange={(e) => setFormData({ ...formData, usd: e.target.value })}
                className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
              />
            </div>

            {/* GBP */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                GBP
              </label>
              <input
                type="text"
                placeholder="e.g. 1.25"
                value={formData.gbp}
                onChange={(e) => setFormData({ ...formData, gbp: e.target.value })}
                className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
              />
            </div>

            {/* EUR */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                EUR
              </label>
              <input
                type="text"
                placeholder="e.g. 1.10"
                value={formData.eur}
                onChange={(e) => setFormData({ ...formData, eur: e.target.value })}
                className="bg-[#f5f4f0] rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
              />
            </div>
          </div>

          <div className="pt-4">
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
                  Save Rates
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
