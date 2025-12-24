"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Хуваарь", href: "/huviar" },
    { name: "Анги", href: "/form/angi" },
    { name: "Багш", href: "/form/bagsh" },
    { name: "Хичээл", href: "/form/hicheel" },
    { name: "Өрөө", href: "/form/room" },
  ];

  // User session-г backend-аас шалгах
  useEffect(() => {
    fetch("http://localhost:8000/api/current_user/", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("http://localhost:8000/user_logout/", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    router.push("/auth/signin");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex justify-between items-center">
        {/* Лого хэсэг */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-2 rounded-lg group-hover:rotate-6 transition-transform">
            <span className="text-white text-xl">🎓</span>
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent tracking-tighter">
            {/* Шаардлагатай бол энд текст */}
          </h1>
        </Link>

        {/* Навигацийн холбоосууд */}
        <nav className="hidden md:flex items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-indigo-600 hover:bg-white/50"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Баруун талын товчлуур */}
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link
                href="/auth/signin"
                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-semibold text-white bg-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-700 transition"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {/* Сайн байнуу, Display Name */}
              <span className="text-sm font-medium text-slate-700">
                Сайн байнуу, {user.display_name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-white bg-red-600 px-3 py-1.5 rounded-md hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
