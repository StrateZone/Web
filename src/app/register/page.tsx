"use client";
import Link from "next/link";
import { FormEventHandler, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Register() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);

    if (
      !userInfo.username ||
      !userInfo.email ||
      !userInfo.password ||
      !userInfo.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (userInfo.password !== userInfo.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Here you would typically send the userInfo data to your backend
    // For this example, we simply show a success message and redirect

    toast.success("Registration successful");
    router.push("/login"); // Redirect to login page after successful registration
  };

  return (
    <div className="bg-white bg-cover bg-no-repeat min-h-screen flex items-center justify-center">
      <div className="bg-primary bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center text-black mb-6">
          Register
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex justify-center mb-6">
          <span className="text-sm text-gray-700">
            Already have an account?
          </span>
          <Link
            href="/login"
            className="text-blue-500 hover:text-blue-700 ml-1 font-medium"
          >
            Login
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-medium mb-1"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
              id="username"
              placeholder="Username"
              value={userInfo.username}
              onChange={({ target }) =>
                setUserInfo({ ...userInfo, username: target.value })
              }
              required
            />
          </div>

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
              value={userInfo.email}
              onChange={({ target }) =>
                setUserInfo({ ...userInfo, email: target.value })
              }
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-medium mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
              id="password"
              type="password"
              placeholder="Password"
              value={userInfo.password}
              onChange={({ target }) =>
                setUserInfo({ ...userInfo, password: target.value })
              }
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-medium mb-1"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={userInfo.confirmPassword}
              onChange={({ target }) =>
                setUserInfo({ ...userInfo, confirmPassword: target.value })
              }
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
              type="submit"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
