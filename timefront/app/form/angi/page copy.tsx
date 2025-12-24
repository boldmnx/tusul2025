"use client";

import { useEffect, useState } from "react";

export default function ClassGroup() {
  const [groups, setGroups] = useState([]);
  const [hutulbur, setHutulbur] = useState("");
  const [groupName, setGroupName] = useState("");
  const [damjaa, setDamjaa] = useState("");
  const [editId, setEditId] = useState(null);

  const getGroups = () => {
    fetch("http://127.0.0.1:8000/service/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "listClassGroup" }),
    })
      .then((r) => r.json())
      .then((d) => setGroups(d.data));
  };

  useEffect(() => {
    getGroups();
  }, []);

  const saveGroup = (e) => {
    e.preventDefault();
    const action = editId ? "updateClassGroup" : "addClassGroup";

    fetch("http://127.0.0.1:8000/service/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        id: editId,
        hutulbur,
        group_name: groupName,
        damjaa,
      }),
    }).then(() => {
      setHutulbur("");
      setGroupName("");
      setDamjaa("");
      setEditId(null);
      getGroups();
    });
  };

  const deleteGroup = (id) => {
    if (confirm("Та энэ ангийг устгахдаа итгэлтэй байна уу?")) {
      fetch("http://127.0.0.1:8000/service/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteClassGroup", id }),
      }).then(() => getGroups());
    }
  };

  const startEdit = (g) => {
    setEditId(g.id);
    setHutulbur(g.hutulbur);
    setGroupName(g.group_name);
    setDamjaa(g.damjaa);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Анги бүртгэл</h2>
          <p className="text-slate-500 text-sm">Системд бүртгэлтэй нийт ангиудын мэдээлэл</p>
        </div>
        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold border border-indigo-100">
          Нийт: {groups.length} анги
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center gap-2 text-slate-600">
          <span className="text-lg">{editId ? "📝" : "➕"}</span>
          <span className="text-xs font-bold uppercase tracking-wider">{editId ? "Мэдээлэл засах" : "Шинэ анги нэмэх"}</span>
        </div>
        <form onSubmit={saveGroup} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">Хөтөлбөрийн нэр</label>
              <input
                type="text"
                value={hutulbur}
                onChange={(e) => setHutulbur(e.target.value)}
                placeholder="Жишээ: Программ хангамж"
                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">Бүлэг / Анги</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Жишээ: ПХ-3А"
                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">Дамжаа</label>
              <input
                type="number"
                value={damjaa}
                onChange={(e) => setDamjaa(e.target.value)}
                placeholder="1-4"
                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            {editId && (
              <button 
                type="button"
                onClick={() => {setEditId(null); setHutulbur(""); setGroupName(""); setDamjaa("");}}
                className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition"
              >
                Цуцлах
              </button>
            )}
            <button className={`px-10 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${editId ? "bg-amber-500 shadow-amber-100 hover:bg-amber-600" : "bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700"}`}>
              {editId ? "Шинэчлэх хадгалах" : "Бүртгэж авах"}
            </button>
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">№</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Хөтөлбөр</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Бүлэг</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Дамжаа</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {groups.map((g, i) => (
                <tr key={g.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="py-4 px-6">
                    <span className="bg-slate-100 text-slate-500 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-700">{g.hutulbur}</td>
                  <td className="py-4 px-6 font-medium text-slate-600">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm border border-indigo-100">
                      {g.group_name}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-slate-700 font-bold">{g.damjaa}</span>
                    <span className="text-slate-400 text-xs ml-1">р курс</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(g)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Засах"
                      >
                        <span className="text-lg">✏️</span>
                      </button>
                      <button
                        onClick={() => deleteGroup(g.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Устгах"
                      >
                        <span className="text-lg">🗑️</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-slate-400 font-medium">
                    Бүртгэлтэй анги одоогоор байхгүй байна.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}