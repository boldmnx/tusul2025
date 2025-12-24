"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/user_logout/", {
      method: "POST",
      credentials: "include", // session cookie устгах
    })
      .then(() => {
        router.push("auth/signin"); // logout болсны дараа login руу
      })
      .catch(() => {
        router.push("auth/signin");
      });
  }, [router]);

  return <p className="text-center mt-20">Logging out...</p>;
};

export default Logout;
