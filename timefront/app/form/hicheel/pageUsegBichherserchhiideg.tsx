"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Course() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [lessonType, setLessonType] = useState("");
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [editId, setEditId] = useState(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [openCourse, setOpenCourse] = useState(false);
  const [listCourseId, setListCourseId] = useState("");
  const MULTI_ROOM = ["лекц", "лаб", "семинар"];

  useEffect(() => {
    let isMounted = true;
    fetch("http://localhost:8000/api/current_user/", { credentials: "include" })
      .then((res) => {
        if (res.status === 200) return res.json();
        throw new Error("Not authenticated");
      })
      .then(() => {
        if (isMounted) setAuthChecked(true);
      })
      .catch(() => {
        if (isMounted) router.replace("/auth/signin");
      });

    return () => {
      isMounted = false;
    };
  }, [router]);
  const handleNameChange = (value) => {
    setName(value);

    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const filtered = courses.filter((c) =>
      c.name.toLowerCase().includes(value.toLowerCase())
    );

    setSearchResults(filtered);
    setShowDropdown(true);
  };
  const getData = () => {
    fetch("http://localhost:8000/service/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "listCourse" }),
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        setCourses(d.data);
      });

    fetch("http://localhost:8000/service/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "listTeacher" }),
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        setTeachers(d.data);
      });

    fetch("http://localhost:8000/service/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "listClassGroup" }),
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        setGroups(d.data);
      });
  };

  useEffect(() => {
    if (authChecked) getData();
  }, [authChecked]);

  const toggleRoomType = (rt) => {
    setRoomTypes(
      roomTypes.includes(rt)
        ? roomTypes.filter((x) => x !== rt)
        : [...roomTypes, rt]
    );
  };

  const toggleGroup = (id) => {
    setSelectedGroups(
      selectedGroups.includes(id)
        ? selectedGroups.filter((g) => g !== id)
        : [...selectedGroups, id]
    );
  };

  const saveCourse = (e) => {
    e.preventDefault();
    const action = editId ? "updateCourse" : "addCourse";

    fetch("http://localhost:8000/service/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        id: editId,
        name,
        teacher_id: teacherId,
        lesson_type: lessonType,
        available_room_types: roomTypes,
        group_ids: selectedGroups,
      }),
      credentials: "include",
    }).then((d) => {
      d.json();
      setName("");
      setTeacherId("");
      setLessonType("");
      setRoomTypes([]);
      setSelectedGroups([]);
      setEditId(null);
      getData();
      alert("Амжилттай хадгалагдлаа");
    });
  };

  const deleteCourse = (id) => {
    if (confirm("Устгахдаа итгэлтэй байна уу?")) {
      fetch("http://localhost:8000/service/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteCourse", id }),
        credentials: "include",
      }).then(() => getData());
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-violet-600 font-bold text-lg animate-pulse">
          Session шалгаж байна...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-violet-100 p-3 rounded-2xl text-2xl">📚</div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            Хичээлийн удирдлага
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Хичээл, багш болон ангиудын уялдаа холбоог тохируулах
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={saveCourse}
            className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 space-y-5 sticky top-24"
          >
            <h3 className="text-lg font-bold text-slate-700 mb-4">
              {editId ? "Хичээл засах" : "Шинэ хичээл бүртгэх"}
            </h3>
            <div className="relative">
              {/* INPUT */}
              <input
                className="w-full bg-slate-50 border-none p-4 rounded-2xl"
                placeholder="Хичээл бичиж хайх..."
                value={courseSearch}
                onChange={(e) => {
                  setCourseSearch(e.target.value);
                  setOpenCourse(true);
                }}
                onFocus={() => setOpenCourse(true)}
                required
              />

              {/* DROPDOWN */}
              {openCourse && (
                <div className="absolute z-20 w-full bg-white border mt-2 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                  {courses
                    .filter((c) =>
                      c.name?.toLowerCase().includes(courseSearch.toLowerCase())
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        className={`p-3 cursor-pointer hover:bg-violet-50 ${
                          listCourseId === c.id ? "bg-violet-100" : ""
                        }`}
                        onClick={() => {
                          setListCourseId(c.id); // сонгосон course ID
                          setCourseSearch(c.name); // input дээр нэр харагдана
                          setOpenCourse(false);
                          setName(c.name); // form submit-д ашиглана
                        }}
                      >
                        {c.name}
                      </div>
                    ))}

                  {/* no result */}
                  {courses.filter((c) =>
                    c.name?.toLowerCase().includes(courseSearch.toLowerCase())
                  ).length === 0 && (
                    <div className="p-3 text-slate-400 text-sm">
                      Илэрц олдсонгүй
                    </div>
                  )}
                </div>
              )}
            </div>

            <select
              className="w-full bg-slate-50 border-none p-4 rounded-2xl"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
            >
              <option value="">Багш сонгох</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <select
              className="w-full bg-slate-50 border-none p-4 rounded-2xl"
              value={lessonType}
              onChange={(e) => setLessonType(e.target.value)}
              required
            >
              <option value="">Хичээлийн төрөл сонгох</option>
              <option value="лекц">лекц</option>
              <option value="лаб">лаб</option>
              <option value="семинар">Семинар</option>
            </select>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                Боломжит өрөөний төрөл
              </label>
              <div className="flex flex-wrap gap-2">
                {MULTI_ROOM.map((rt) => (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => toggleRoomType(rt)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      roomTypes.includes(rt)
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {rt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                Холбогдох ангиуд
              </label>
              <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
                {groups.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => toggleGroup(g.id)}
                    className={`p-3 rounded-xl border cursor-pointer flex justify-between ${
                      selectedGroups.includes(g.id)
                        ? "border-violet-500 bg-violet-50 text-violet-700"
                        : "border-slate-100 bg-slate-50 text-slate-500"
                    }`}
                  >
                    <span>
                      {g.hutulbur} - {g.group_name}
                    </span>
                    {selectedGroups.includes(g.id) && <span>✓</span>}
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-2xl">
              {editId ? "Өөрчлөлтийг хадгалах" : "Хичээл нэмэх"}
            </button>
          </form>
        </div>

        {/* Right Side: Table */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase">
                    №
                  </th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase">
                    Хичээл
                  </th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase">
                    Багш
                  </th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase text-center">
                    Анги
                  </th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase text-right">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {courses.map((c, index) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="p-5 text-sm text-slate-600 font-medium">
                      {index + 1}
                    </td>

                    <td className="p-5">
                      <div className="font-bold text-slate-700">{c.name}</div>
                      <div className="flex gap-1 mt-1">
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase font-bold">
                          {c.lesson_type}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-sm text-slate-600 font-medium">
                      {c.teacher?.name || c.teacher_name || ""}
                    </td>
                    <td className="p-5 text-center">
                      <span className="bg-violet-100 text-violet-700 px-2.5 py-1 rounded-lg text-xs font-black">
                        {c.groups?.length || 0}
                      </span>
                    </td>
                    <td className="p-5 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditId(c.id);
                          setName(c.name || "");
                          setLessonType(c.lesson_type || "");

                          setTeacherId(c.teacher?.id || "");

                          setRoomTypes(c.available_room_types || []);

                          // groups массивыг зөв тодорхойлох
                          const groupsIds = c.groups?.map((g) => g.id) || [];
                          setSelectedGroups(groupsIds);
                        }}
                        className="p-2 text-slate-400 hover:text-violet-600"
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() => deleteCourse(c.id)}
                        className="p-2 text-slate-400 hover:text-red-500"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
