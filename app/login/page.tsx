"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      alert(result.error);
      return;
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 transition-colors duration-300 dark:bg-gray-900">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg transition-colors duration-300 dark:bg-gray-800">
        <h1 className="text-3xl font-semibold text-center mb-6 text-white">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <label htmlFor="email" className="block text-gray-300 font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />

          <label htmlFor="password" className="block text-gray-300 font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-3 text-white font-semibold rounded-md shadow-md transition-colors ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full py-3 text-white font-semibold rounded-md shadow-md bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Sign in with GitHub
          </button>
        </div>

        <p className="mt-6 text-center text-gray-400">
          Don’t have an account?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
