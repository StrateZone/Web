"use client";
import Link from "next/link";
import { FormEventHandler, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { toast } from "react-toastify";

export default function Page() {
  const { status } = useSession();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);

    if (!userInfo.username || !userInfo.password) {
      setError("Please enter both email and password.");
      return;
    }

    const res = await signIn("credentials", {
      username: userInfo.username,
      password: userInfo.password,
      redirect: false,
    });

    if (res && res.error) {
      setError("Invalid email or password. Please try again.");
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
      toast.success("Login successfully");
    }
  }, [status, router]);

  return (
    <div className="bg-white bg-cover bg-no-repeat min-h-screen flex items-center justify-center">
      <div className="bg-primary bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center text-black mb-6">
          Login
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex justify-center mb-6">
          <span className="text-sm text-gray-700">
            Don&apos;t have an account?
          </span>
          <Link
            href="/register"
            className="text-blue-500 hover:text-blue-700 ml-1 font-medium"
          >
            Sign up
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
              placeholder="username"
              value={userInfo.username}
              onChange={({ target }) =>
                setUserInfo({ ...userInfo, username: target.value })
              }
              required
            />
          </div>
          <div className="mb-6">
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
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
              type="submit"
            >
              Login
            </button>

            <Link
              href="#"
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
