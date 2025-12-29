// pages/index.js
import React from "react";
import Link from "next/link"; // Next.js-ийн Link-ийг импортлох

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section
        className="relative bg-blue-600 py-28 px-4 flex flex-col items-center justify-center text-center text-white min-h-[500px] overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://scontent.fuln6-3.fna.fbcdn.net/v/t39.30808-6/557625603_4234151806861322_2599870835742741136_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=GOiwQydnlIgQ7kNvwESI0k4&_nc_oc=Adnd44vnUaCf4DsHTin932qUxQIT1TYoPp5eVsFJDi7JK0LVHc2w110IwJ-lcJNusqRlb54vCw3zOPrqlrmV_MKs&_nc_zt=23&_nc_ht=scontent.fuln6-3.fna&_nc_gid=c3jMRb90_bcxrfr57iZ5gA&oh=00_AfmZhFqeYhkoudZB_kmX4tEACLwodqNpF9h8_6DAVGjUGA&oe=694DC9B4')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-4xl z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight drop-shadow-md">
            Мандах ИС Мэдээлэл, Технологийн сургууль{" "}
          </h1>
          <p className="text-lg md:text-xl mb-8 text-blue-50 font-medium drop-shadow-md">
            “БИД МЭДЛЭГЭЭР БАЯЛГИЙГ БҮТЭЭНЭ”
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-xl active:scale-95">
              Эхлэх
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-blue-600 transition active:scale-95">
              Дэлгэрэнгүй
            </button>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 1. Хичээлийн хуваарь руу үсрэх */}
          <Link href="/huviar" className="block group">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-2 h-full">
              <div className="text-4xl mb-6 bg-blue-50 w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
                📚
              </div>
              <h3 className="text-xl font-black mb-2 text-gray-800">
                Хичээлийн хуваарь
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Өөрийн цаг заваа зөв төлөвлөж, хичээлээ цагтаа амжуулаарай.
              </p>
              <div className="mt-6 text-blue-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                Үзэх <span>➜</span>
              </div>
            </div>
          </Link>

          {/* 2. Багш нарын бүртгэл рүү үсрэх */}
          <Link href="/form/bagsh" className="block group">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:border-emerald-200 transition-all duration-300 hover:-translate-y-2 h-full">
              <div className="text-4xl mb-6 bg-emerald-50 w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
                👥
              </div>
              <h3 className="text-xl font-black mb-2 text-gray-800">
                Шилдэг багш нар
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Мэргэжлийн туршлагатай багш нараас зөвлөгөө авч суралцаарай.
              </p>
              <div className="mt-6 text-emerald-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                Бүртгэл харах <span>➜</span>
              </div>
            </div>
          </Link>

          {/* 3. Сертификат эсвэл бусад хэсэг */}
          <Link href="/" className="block group">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:border-amber-200 transition-all duration-300 hover:-translate-y-2 h-full">
              <div className="text-4xl mb-6 bg-amber-50 w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
                🏆
              </div>
              <h3 className="text-xl font-black mb-2 text-gray-800">
                Сертификат
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Амжилттай төгсөж, өөрийн ур чадвараа баталгаажуулаарай.
              </p>
              <div className="mt-6 text-amber-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                Шалгах <span>➜</span>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
