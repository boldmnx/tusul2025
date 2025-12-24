"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Room() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [roomType, setRoomType] = useState("");
  const [roomNumbers, setRoomNumbers] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    // Cleanup protection for async fetch
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("http://localhost:8000/api/current_user/", {
          credentials: "include",
        });

        if (!res.ok) {
          // If not authenticated, redirect to sign in page
          router.replace("/auth/signin");
          return;
        }

        if (isMounted) {
          setCheckingAuth(false); // Mark as auth checked
        }
      } catch (e) {
        // Handle error and redirect to signin
        router.replace("/auth/signin");
      }
    }

    // Call the function to check auth
    checkAuth();

    // Cleanup flag
    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!checkingAuth) {
      // Only fetch rooms if auth is checked and user is authenticated
      fetch("http://localhost:8000/service/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "listRoom" }),
        credentials: "include",
      })
        .then((r) => r.json())
        .then((d) => setRooms(d.data));
    }
  }, [checkingAuth]); // Trigger only after auth check

  const saveRoom = (e) => {
    e.preventDefault();
    const action = editId ? "updateRoom" : "addRoom";

    const numbersArray = roomNumbers
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n)
      .map((n) => ({ id: n }));

    fetch("http://localhost:8000/service/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        id: editId,
        room_type: roomType,
        room_number: numbersArray,
      }),
      credentials: "include",
    }).then(() => {
      setRoomType("");
      setRoomNumbers("");
      setEditId(null);
      // Fetch updated list of rooms
      fetchRooms();
    });
  };

  const deleteRoom = (id) => {
    if (confirm("Энэ өрөөний тохиргоог устгах уу?")) {
      fetch("http://localhost:8000/service/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteRoom", id }),
        credentials: "include",
      }).then(() => fetchRooms());
    }
  };

  const startEdit = (r) => {
    setEditId(r.id);
    setRoomType(r.room_type);
    setRoomNumbers(
      Array.isArray(r.room_number)
        ? r.room_number.map((n) => n.id).join(", ")
        : ""
    );
  };

  const fetchRooms = () => {
    fetch("http://localhost:8000/service/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "listRoom" }),
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setRooms(d.data));
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-indigo-600 font-bold text-lg animate-pulse">
          Session шалгаж байна...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-rose-100 p-3 rounded-2xl text-2xl">🏢</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
              Өрөөний зохион байгуулалт
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Танхимын төрөл болон дугааруудыг удирдах
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <form
          onSubmit={saveRoom}
          className="p-8 flex flex-col md:flex-row items-end gap-6"
        >
          <div className="w-full md:w-1/3 space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">
              Өрөөний төрөл
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:ring-4 focus:ring-rose-50 focus:border-rose-400 outline-none transition-all appearance-none text-slate-700 font-medium"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              required
            >
              <option value="">Сонгох...</option>
              <option value="лекц">Лекц</option>
              <option value="лаб">Лаб</option>
              <option value="семинар">Семинар</option>
            </select>
          </div>

          <div className="w-full md:w-2/3 space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">
              Өрөөний дугаарууд (Таслалаар тусгаарлах)
            </label>
            <input
              type="text"
              placeholder="Жишээ: 101, 102, 204"
              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:ring-4 focus:ring-rose-50 focus:border-rose-400 outline-none transition-all placeholder:text-slate-300"
              value={roomNumbers}
              onChange={(e) => setRoomNumbers(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setRoomType("");
                  setRoomNumbers("");
                }}
                className="px-6 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition"
              >
                Болих
              </button>
            )}
            <button
              className={`whitespace-nowrap px-10 py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                editId
                  ? "bg-amber-500 shadow-amber-100"
                  : "bg-rose-500 shadow-rose-100 hover:bg-rose-600"
              }`}
            >
              {editId ? "Шинэчлэх" : "Танхим нэмэх"}
            </button>
          </div>
        </form>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-[2rem] border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute -right-4 -top-4 text-slate-50 text-6xl font-black select-none group-hover:text-rose-50 transition-colors capitalize">
              {r.room_type[0]}
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border border-rose-100">
                  {r.room_type}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(r)}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-500 transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteRoom(r.id)}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {Array.isArray(r.room_number) &&
                  r.room_number.map((n) => (
                    <span
                      key={n.id}
                      className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-slate-200 shadow-sm"
                    >
                      {n.id}
                    </span>
                  ))}
              </div>

              <div className="pt-4 flex items-center text-slate-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                Нийт {r.room_number?.length || 0} өрөө бэлэн
              </div>
            </div>
          </div>
        ))}

        {rooms.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
            <p className="text-slate-400 font-medium font-lg italic">
              Бүртгэлтэй танхим одоогоор алга.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
