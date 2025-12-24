"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SignIn = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState(null); // success | error
  const [messageType, setMessageType] = useState("success");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch("http://localhost:8000/user_login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include", // session cookie ашиглах бол
      });

      const data = await res.json();

      if (res.ok) {
        setMessageType("success");
        setMessage("Logged in successfully!");
        // Амжилттай login бол schedule page руу чиглүүлэх
        setTimeout(() => router.push("/huviar/"), 1000);
      } else {
        setMessageType("error");
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      setMessageType("error");
      setMessage("Server error. Try again later.");
    }
  };

  // Auto hide alert
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <>
      <div className="flex justify-center mt-24">
        <div className="w-full max-w-sm bg-white shadow-md rounded-lg p-6">
          <h4 className="text-xl font-semibold mb-4 text-center">Sign in</h4>

          {message && (
            <div
              className={`mb-4 px-4 py-2 rounded text-sm flex justify-between items-center
                ${
                  messageType === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
            >
              {message}
              <button
                onClick={() => setMessage(null)}
                className="text-lg leading-none"
              >
                &times;
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="email"
              placeholder="Email or Phone"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>

      <p className="text-center mt-6 text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </>
  );
};

export default SignIn;
