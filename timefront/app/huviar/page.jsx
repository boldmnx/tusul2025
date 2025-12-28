"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Timetable from "@/components/Timetable";

export default function TimetablePage() {
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:8000/api/current_user/", {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 200) return res.json();
        throw new Error("Not authenticated");
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        router.replace("/auth/signin"); // Login хийгээгүй бол шууд redirect
      })
      .finally(() => {
        setCheckingAuth(false);
      });

    setCurrentTime(new Date().toLocaleTimeString());
  }, [router]);

  
  if (checkingAuth || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-violet-600 font-bold text-lg animate-pulse">
          Session шалгаж байна...
        </p>
      </div>
    );
  }

  const handleGenerate = () => {
    setLoading(true);
    setShow(false);

    setTimeout(() => {
      setShow(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-xl">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Системийн хуваарь
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                Нийт хичээл болон танхимын ашиглалтыг нэг дороос
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-200 ${
              loading
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "⚡ Хуваарь гаргах"
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="relative min-h-[600px]">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md z-20 rounded-3xl border border-slate-200">
              <p className="mt-4 text-indigo-600 font-bold animate-pulse tracking-wide">
                ХУВААРЬ БОЛОВСРУУЛЖ БАЙНА...
              </p>
            </div>
          )}

          {show && !loading && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                <div className="bg-slate-50/80 px-8 py-5 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-tighter">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                      Идэвхтэй хуваарь
                    </span>
                  </div>
                </div>

                <div className="p-1 md:p-4 bg-white overflow-x-auto custom-scrollbar">
                  <div className="min-w-[1000px]">
                    <Timetable />
                  </div>
                </div>

                <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-right">
                  <p className="text-xs text-slate-400 font-medium italic">
                    Сүүлд шинэчлэгдсэн: {currentTime}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
