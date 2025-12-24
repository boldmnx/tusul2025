"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    repeat_password: "",
    phone_number: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    try {
      const res = await fetch("http://127.0.0.1:8000/user_register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        // Амжилттай бүртгэлээс хойш login page руу чиглүүлэх
        setTimeout(() => router.push("/auth/signin/"), 1500);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.message) {
          setMessage(data.message);
        }
      }
    } catch (err) {
      setMessage("Server error. Try again later.");
    }
  };

  return (
    <section className="py-10 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h4 className="text-2xl font-semibold mb-6 text-center">Sign up</h4>

        {message && (
          <div className="mb-4 text-center text-red-600 font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "First Name", name: "first_name", type: "text" },
            { label: "Last Name", name: "last_name", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Password", name: "password", type: "password" },
            {
              label: "Confirm Password",
              name: "repeat_password",
              type: "password",
            },
            { label: "Phone Number", name: "phone_number", type: "text" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
              {errors[field.name] && (
                <p className="text-red-600 text-sm mt-1">
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Have an account?{" "}
          <Link href="/auth/signin/" className="text-blue-600 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
