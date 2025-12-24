"use client";

import { useState } from "react";
import Timetable from "@/components/Timetable";
import Spinner from "@/components/Spinner";

export default function TimetablePage() {
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

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
      {/* Container-ийг илүү өргөн болгов (max-w-7xl) */}
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header Section - Илүү авсаархан бөгөөд цэгцтэй */}
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
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-200
              ${
                loading
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95"
              }
            `}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "⚡ Хуваарь гаргах"
            )}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="relative min-h-[600px]">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md z-20 rounded-3xl border border-slate-200">
              <Spinner />
              <p className="mt-4 text-indigo-600 font-bold animate-pulse tracking-wide">
                ХУВААРЬ БОЛОВСРУУЛЖ БАЙНА...
              </p>
            </div>
          )}

          {show && !loading ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Хүснэгтийн үндсэн карт - Бүрэн өргөнөөр */}
              <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                {/* Хүснэгтийн дээд хэсэг (Toolbar) */}
                <div className="bg-slate-50/80 px-8 py-5 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-tighter">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                      Идэвхтэй хуваарь
                    </span>
                    <div className="hidden md:flex gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        🟢 Танхим боломжтой
                      </span>
                      <span className="flex items-center gap-1">
                        🔵 Хичээлтэй
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* Window Controls - Загвар оруулах зорилгоор */}
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                  </div>
                </div>

                {/* Timetable Component - Доторх зайг (Padding) багасгаж хүснэгтийг томруулав */}
                <div className="p-1 md:p-4 bg-white overflow-x-auto custom-scrollbar">
                  <div className="min-w-[1000px]">
                    {" "}
                    {/* Хүснэгтийг шахагдахаас хамгаална */}
                    <Timetable />
                  </div>
                </div>

                {/* Хүснэгтийн доод хэсэг */}
                <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-right">
                  <p className="text-xs text-slate-400 font-medium italic">
                    Сүүлд шинэчлэгдсэн: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            !loading && (
              <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white/50 transition-all hover:bg-white hover:border-indigo-200 group">
                <div className="w-24 h-24 bg-white shadow-xl shadow-slate-200 rounded-3xl flex items-center justify-center mb-6 text-4xl group-hover:scale-110 transition-transform duration-300">
                  📅
                </div>
                <h3 className="text-slate-800 font-black text-2xl">
                  Хуваарь одоогоор хоосон
                </h3>
                <p className="text-slate-500 mt-3 max-w-sm text-center font-medium leading-relaxed">
                  Систем дэх өгөгдлүүд дээр үндэслэн хичээлийн хуваарийг
                  боловсруулахын тулд "Хуваарь шинэчлэх" товчийг дарна уу.
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Custom Scrollbar CSS */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
