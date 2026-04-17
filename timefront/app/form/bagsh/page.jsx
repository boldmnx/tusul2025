"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Bagsh() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);

  const [bagsh, setBagsh] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    ovog: "",
    age: "",
    email: "",
    phone: "",
    photo: null,
  });

  /* =====================================================
        1) ЗӨВ AUTH CHECK — (нэг л удаа ажиллана!)
     ===================================================== */
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("http://localhost:8000/api/current_user/", {
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/auth/signin");
          return;
        }

        if (isMounted) setCheckingAuth(false);
      } catch (e) {
        router.replace("/auth/signin");
      }
    }

    checkAuth();
    return () => (isMounted = false);
  }, [router]);

  /* =====================================================
        2) БАГШ НАРЫН ЖАГСААЛТ АВАХ
     ===================================================== */
  const getTeachers = () => {
    const fd = new FormData();
    fd.append("action", "listTeacher");

    fetch("http://localhost:8000/service/", {
      method: "POST",
      body: fd,
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("##########", JSON.stringify(data.data, null, 2));
        setBagsh(data.data);
      });
  };

  useEffect(() => {
    if (!checkingAuth) {
      setTimeout(() => {
        getTeachers();
      }, 0);
    }
  }, [checkingAuth]);

  /* =====================================================
        3) LOADING — SESSION БАТАЛГААЖУУЛАХ ХҮЛЭЭЛТ
     ===================================================== */
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-indigo-600 font-bold text-lg animate-pulse">
          Session шалгаж байна...
        </p>
      </div>
    );
  }

  /* =====================================================
        4) ЗУРАГ СОЛИХ
     ===================================================== */
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  /* =====================================================
        5) ХАДГАЛАХ (add/update)
     ===================================================== */
  const saveTeacher = (e) => {
    e.preventDefault();

    const action = selectedTeacher?.id ? "updateTeacher" : "addTeacher";

    const fd = new FormData();
    fd.append("action", action);

    if (selectedTeacher?.id) {
      fd.append("id", selectedTeacher.id);
    }

    fd.append("name", formData.name);
    fd.append("ovog", formData.ovog);
    fd.append("age", formData.age);
    fd.append("email", formData.email);
    fd.append("phone", formData.phone);

    if (formData.photo) {
      fd.append("photo", formData.photo);
    }
    fetch("http://localhost:8000/service/", {
      method: "POST",
      body: fd, // ❗️ FormData → headers байхгүй!
      credentials: "include",
    })
      .then((res) => res.json())
      .then(() => {
        setIsEditing(false);
        setSelectedTeacher(null);
        setPreview(null);
        getTeachers();
      });
  };

  /* =====================================================
        6) УСТГАХ
     ===================================================== */
  const deleteTeacher = (id) => {
    if (confirm("Та энэ багшийг устгахдаа итгэлтэй байна уу?")) {
      const fd = new FormData();
      fd.append("action", "deleteTeacher");
      fd.append("id", id);

      fetch("http://localhost:8000/service/", {
        method: "POST",
        body: fd,
        credentials: "include",
      }).then(() => {
        setSelectedTeacher(null);
        getTeachers();
      });
    }
  };

  /* =====================================================
        7) ЗАСВАР ЭХЛҮҮЛЭХ
     ===================================================== */
  const startEdit = () => {
    setFormData({
      name: selectedTeacher.name,
      ovog: selectedTeacher.ovog,
      // name: selectedTeacher.ovog ?? "",
      age: selectedTeacher.age,
      email: selectedTeacher.email,
      phone: selectedTeacher.phone,
      photo: null,
    });

    setPreview(selectedTeacher.photo_url);
    setIsEditing(true);
  };

  /* =====================================================
        8) ҮЛДЭХ НЬ — ТАНЫ ӨӨРИЙН UI
        
     ===================================================== */

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      {/* Зүүн тал: Багш нарын жагсаалт */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Багш нарын жагсаалт
          </h2>
          <button
            onClick={() => {
              setSelectedTeacher(null);
              setIsEditing(true);
              setFormData({
                name: "",
                ovog: "",
                age: "",
                email: "",
                phone: "",
                photo: null,
              });
              setPreview(null);
            }}
            className="bg-emerald-600 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
          >
            + ШИНЭ БАГШ
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
          {bagsh.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                setSelectedTeacher(t);
                setIsEditing(false);
              }}
              className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center gap-4 ${
                selectedTeacher?.id === t.id
                  ? "bg-emerald-600 border-emerald-600 shadow-xl shadow-emerald-200"
                  : "bg-white border-slate-100 hover:border-emerald-300 hover:shadow-md"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 shrink-0 overflow-hidden border-2 border-white/20">
                {t.photo_url ? (
                  <img
                    src={t.photo_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                    {t.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4
                  className={`font-bold text-sm ${
                    selectedTeacher?.id === t.id
                      ? "text-white"
                      : "text-slate-800"
                  }`}
                >
                  {t.ovog} {t.name}
                </h4>
                <p
                  className={`text-[10px] font-medium uppercase ${
                    selectedTeacher?.id === t.id
                      ? "text-emerald-100"
                      : "text-slate-400"
                  }`}
                >
                  {t.phone || "---"}
                </p>
              </div>
              {selectedTeacher?.id === t.id && (
                <span className="text-white">➜</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[450px] shrink-0">
        <div className="sticky top-6">
          {isEditing ? (
            /* ЗА sax ХЭСЭГ (FORM) */
            <div className="bg-white rounded-[2.5rem] border border-emerald-100 p-8 shadow-2xl shadow-emerald-100/50 animate-in zoom-in-95 duration-300">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                <span className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                  📝
                </span>{" "}
                {selectedTeacher ? "Мэдээлэл засах" : "Шинэ багш бүртгэх"}
              </h3>
              <form onSubmit={saveTeacher} className="space-y-4">
                <div className="flex justify-center mb-4">
                  <label className="relative cursor-pointer group">
                    <div className="w-24 h-24 rounded-full border-4 border-slate-50 overflow-hidden bg-slate-100 shadow-inner flex items-center justify-center">
                      {preview ? (
                        <img
                          src={preview}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">📷</span>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
                <input
                  placeholder="Овог"
                  required
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400 transition-all font-bold"
                  value={formData.ovog ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, ovog: e.target.value })
                  }
                />
                <input
                  placeholder="Нэр"
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400 transition-all font-bold"
                  value={formData.name ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <input
                  placeholder="И-мэйл"
                  required
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400 transition-all font-bold"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Утас"
                    required
                    className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400 transition-all font-bold"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                  <input
                    required
                    placeholder="Нас"
                    type="number"
                    className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400 transition-all font-bold"
                    value={formData.age ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition"
                  >
                    БОЛИХ
                  </button>
                  <button
                    type="submit"
                    className="flex-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition"
                  >
                    ХАДГАЛАХ
                  </button>
                </div>
              </form>
            </div>
          ) : selectedTeacher ? (
            /* ДЭЛГЭРЭНГҮЙ ХАРАХ ХЭСЭГ (PROFILE) */
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 animate-in slide-in-from-right-8 duration-500">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-emerald-400 to-teal-500 p-1 shadow-xl">
                  <div className="w-full h-full rounded-[2.3rem] bg-white overflow-hidden">
                    {selectedTeacher.photo_url ? (
                      <img
                        src={selectedTeacher.photo_url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-black text-emerald-500">
                        {selectedTeacher.name[0]}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">
                    {selectedTeacher.ovog} {selectedTeacher.name}
                  </h3>
                  <p className="text-emerald-600 font-bold text-sm tracking-widest uppercase mt-1">
                    Мэргэшсэн Багш
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                  <span className="text-xl">📧</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      И-мэйл
                    </span>
                    <span className="font-bold text-slate-700">
                      {selectedTeacher.email || "Байхгүй"}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                  <span className="text-xl">📞</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      Утас
                    </span>
                    <span className="font-bold text-slate-700">
                      {selectedTeacher.phone || "---"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">
                      Нас
                    </span>
                    <span className="font-bold text-slate-700 text-lg">
                      {selectedTeacher.age || "??"}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">
                      Статус
                    </span>
                    <span className="font-bold text-emerald-500 text-lg">
                      Идэвхтэй
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={startEdit}
                  className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-black hover:bg-slate-900 transition active:scale-95 shadow-lg"
                >
                  ЗАСАХ
                </button>
                <button
                  onClick={() => deleteTeacher(selectedTeacher.id)}
                  className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition active:scale-95"
                >
                  🗑️
                </button>
              </div>
            </div>
          ) : (
            /* ХООСОН ҮЕИЙН ТӨЛӨВ */
            <div className="h-[500px] border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 p-10 text-center">
              <span className="text-6xl mb-4 opacity-50">👤</span>
              <p className="font-bold uppercase tracking-widest text-sm">
                Багшаа сонгож мэдээллийг нь харна уу
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
