"use client";
import React, { useEffect, useState } from "react";

const TeacherScheduleTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((resData) => {
        // Жишээ: resData[0].entries гэж ирж байна гэж үзье
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

  // Өдөрийг монголд хөрвүүлэх
  const dayMap = {
    Mon: "Даваа",
    Tue: "Мягмар",
    Wed: "Лхагва",
    Thu: "Пүрэв",
    Fri: "Баасан",
  };

  // Хичээлүүдийг багшаар бүлэглэх
  const teacherLessons = data.map((entry) =>
    entry.groups.map((group) => ({
      teacher: entry.teacher,
      day: dayMap[entry.day] || entry.day,
      time: entry.time,
      subject: entry.course_name,
      type: entry.lesson_type,
      room: entry.room,
      group: group,
    }))
  ).flat();

  const groupedByTeacher = teacherLessons.reduce((acc, lesson) => {
    if (!acc[lesson.teacher]) acc[lesson.teacher] = [];
    acc[lesson.teacher].push(lesson);
    return acc;
  }, {});

  // Хичээлийн төрөл өнгөөр ялгах
  const typeColor = {
    лекц: "bg-blue-50 border-blue-200 text-blue-900",
    лаб: "bg-emerald-50 border-emerald-200 text-emerald-900",
    семинар: "bg-amber-50 border-amber-200 text-amber-900",
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-slate-300 text-sm">
        <thead>
          <tr className="bg-slate-200">
            <th className="border p-2">Багш</th>
            <th className="border p-2">Өдөр</th>
            <th className="border p-2">Цаг</th>
            <th className="border p-2">Хичээл</th>
            <th className="border p-2">Төрөл</th>
            <th className="border p-2">Өрөө</th>
            <th className="border p-2">Бүлэг</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedByTeacher).map(([teacher, lessons]) =>
            lessons.map((lesson, idx) => (
              <tr key={`${teacher}-${idx}`} className="hover:bg-slate-50">
                {idx === 0 && (
                  <td rowSpan={lessons.length} className="border p-2 font-bold bg-slate-50">
                    {teacher}
                  </td>
                )}
                <td className="border p-2">{lesson.day}</td>
                <td className="border p-2">{lesson.time}</td>
                <td className={`border p-2 font-bold ${typeColor[lesson.type.toLowerCase()] || ""}`}>
                  {lesson.subject}
                </td>
                <td className="border p-2">{lesson.type}</td>
                <td className="border p-2">{lesson.room}</td>
                <td className="border p-2">{lesson.group}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherScheduleTable;
