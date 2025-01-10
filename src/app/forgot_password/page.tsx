"use client";
import { FormEventHandler, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      // Simulating password reset logic (you'll replace this with actual logic)
      // For example: You might call an API to send a password reset link to the user's email.
      await fakePasswordReset(); // Replace this with actual API call
      setMessage("A password reset link has been sent to your email.");
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  };

  // Simulate password reset request (replace this with your real logic)
  async function fakePasswordReset() {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return (
    <div className="bg-white bg-cover bg-no-repeat min-h-screen flex items-center justify-center">
      <div className="bg-primary bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center text-black mb-6">
          Forgot Password
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && (
          <p className="text-green-500 text-center mb-4">{message}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-medium mb-1"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
              type="submit"
            >
              Send Reset Link
            </button>

            <Link
              href="/login"
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
