"use client";
import React, { useEffect, useState } from "react";
import TeacherScheduleTable from "@/components/TeacherScheduleTable";
const Timetable = () => {
  const [data, setData] = useState([]);
  const [openSection, setOpenSection] = useState(null); // "teacher" эсвэл "student" эсвэл null

  const downloadPdf = async () => {
    try {
      const res = await fetch("http://localhost:8000/schedule_pdf_view/", {
        method: "GET", // GET буюу POST
        credentials: "include",
      });

      if (!res.ok) throw new Error("PDF татахад алдаа гарлаа");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "student_schedule.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert("PDF татахад алдаа гарлаа");
    }
  };

  useEffect(() => {
    fetch("http://localhost:8000/", {
      credentials: "include", // cookie session дамжуулна
    })
      .then((res) => res.json())
      .then((resData) => {
        setData(resData[0].entries);
      })
      .catch((err) => console.error(err));
  }, []);

  if (!data.length)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="ml-3 text-slate-500 font-medium">
          Хуваарь ачааллаж байна...
        </p>
      </div>
    );

  const dayMap = {
    Mon: "Даваа",
    Tue: "Мягмар",
    Wed: "Лхагва",
    Thu: "Пүрэв",
    Fri: "Баасан",
  };
  const orderedDays = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан"];

  const groupedByDay = data.reduce((acc, item) => {
    const day = dayMap[item.day] || item.day;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  const groupsList = [
    "Мэдээллийн систем (1-1)",
    "Программ хангамж (1-1)",
    "Программ хангамж (1-2)",
    "Программ хангамж (2-1)",
    "Мэдээллийн систем (2-1)",
    "Мэдээллийн систем (3-1)",
    "Программ хангамж (3-1)",
    "Мэдээллийн систем (4-1)",
    "Программ хангамж (4-1)",
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            Хичээлийн нэгдсэн хуваарь
          </h2>
          <p className="text-slate-500 text-sm font-medium italic">
            2024-2025 оны Намрын улирал
          </p>
        </div>
        <div className="flex gap-2 text-xs font-bold uppercase">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Лекц
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Лаб /
            Сем
          </span>
        </div>
      </div>

      <button
        onClick={() =>
          setOpenSection(openSection === "teacher" ? null : "teacher")
        }
        className="w-full text-left p-4 bg-blue-50 rounded-xl font-bold"
      >
        Багшийн хичээлийн хуваарь
      </button>
      {openSection === "teacher" && (
        <div className="mt-4">
          <TeacherScheduleTable data={data} />
        </div>
      )}

      <button
        onClick={() =>
          setOpenSection(openSection === "student" ? null : "student")
        }
        className="w-full text-left p-4 bg-emerald-50 rounded-xl font-bold"
      >
        Оюутны хичээлийн хуваарь
      </button>
      {openSection === "student" && (
        <div className="mt-4 bg-white shadow-xl shadow-slate-200/50 rounded-[2rem] border border-slate-200 overflow-hidden">
          <h2 className="text-xl font-bold mb-4">Оюутны хичээлийн хуваарь</h2>

          <div className="flex justify-end mb-4">
            <button
              onClick={downloadPdf}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              PDF татах
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white shadow-xl shadow-slate-200/50 rounded-[2rem] border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="py-4 px-4 border-r border-slate-700 font-black uppercase tracking-wider sticky left-0 z-20 bg-slate-800">
                      Өдөр
                    </th>
                    <th className="py-4 px-4 border-r border-slate-700 font-black uppercase tracking-wider sticky left-[78px] z-20 bg-slate-800">
                      Цаг
                    </th>
                    {groupsList.map((g) => (
                      <th
                        key={g}
                        className="py-4 px-3 border-r border-slate-700 font-bold min-w-[140px] leading-tight"
                      >
                        {g}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {orderedDays.map((day) => {
                    const lessons = groupedByDay[day] || [];
                    const groupedByTime = lessons.reduce((acc, l) => {
                      if (!acc[l.time]) acc[l.time] = [];
                      acc[l.time].push(l);
                      return acc;
                    }, {});
                    const times = Object.keys(groupedByTime).sort();

                    return times.map((time, i) => {
                      const timeLessons = groupedByTime[time];
                      const uniqueLessons = [];
                      timeLessons.forEach((l) => {
                        const existing = uniqueLessons.find(
                          (u) =>
                            u.course_name === l.course_name &&
                            u.lesson_type === l.lesson_type &&
                            u.room === l.room &&
                            u.teacher === l.teacher
                        );
                        if (existing) {
                          existing.groups = [
                            ...new Set([...existing.groups, ...l.groups]),
                          ];
                        } else {
                          uniqueLessons.push({ ...l });
                        }
                      });

                      return (
                        <tr
                          key={`${day}-${time}`}
                          className="group hover:bg-slate-50 transition-colors"
                        >
                          {i === 0 && (
                            <td
                              rowSpan={times.length}
                              className="border-r border-slate-200 text-center font-black bg-slate-50 text-slate-700 uppercase vertical-text sticky left-0 z-10 w-20"
                            >
                              <span className="rotate-180 [writing-mode:vertical-lr]">
                                {day}
                              </span>
                            </td>
                          )}
                          <td className="border-r border-slate-200 py-4 px-3 text-center font-bold text-slate-500 bg-white sticky left-[78px] z-10 whitespace-nowrap">
                            {time}
                          </td>

                          {groupsList.map((group) => {
                            const lesson = uniqueLessons.find((l) =>
                              l.groups.includes(group)
                            );

                            if (lesson && !lesson.rendered) {
                              const startIdx = groupsList.indexOf(group);
                              const consecutiveCount = groupsList
                                .slice(startIdx)
                                .reduce((count, g, idx, arr) => {
                                  // Зөвхөн дараалсан (consecutive) бүлгүүдийг тоолно
                                  if (
                                    lesson.groups.includes(g) &&
                                    (idx === 0 ||
                                      lesson.groups.includes(arr[idx - 1]))
                                  ) {
                                    return count + 1;
                                  }
                                  return count;
                                }, 0);

                              lesson.rendered = true;
                              const isLecture = lesson.lesson_type
                                ?.toLowerCase()
                                .includes("лекц");

                              return (
                                <td
                                  key={group}
                                  colSpan={consecutiveCount}
                                  className={`border-r border-slate-200 p-2 transition-all`}
                                >
                                  <div
                                    className={`h-full rounded-2xl p-3 text-center shadow-sm border flex flex-col justify-center gap-1 ${
                                      isLecture
                                        ? "bg-blue-50 border-blue-200 text-blue-900 shadow-blue-100/50"
                                        : "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-100/50"
                                    }`}
                                  >
                                    <div className="font-black leading-tight uppercase tracking-tighter text-[11px] opacity-70 mb-1">
                                      {lesson.lesson_type}
                                    </div>
                                    <div className="font-bold text-[14px] leading-snug drop-shadow-sm">
                                      {lesson.course_name}
                                    </div>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                      <span className="text-[11px] font-bold bg-white/60 py-0.5 px-2 rounded-full self-center border border-white/40">
                                        🚪 {lesson.room}
                                      </span>
                                      <span className="text-[11px] font-medium opacity-80">
                                        👤 {lesson.teacher}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              );
                            }
                            if (lesson && lesson.rendered) return null;
                            return (
                              <td
                                key={group}
                                className="border-r border-slate-100 p-2"
                              ></td>
                            );
                          })}
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
