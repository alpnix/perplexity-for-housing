"use client";

import { useAuth } from "@/hooks/useAuth";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";


const LoginPage = () => {
  const ALLOW_ONE_TAP = false; 
  const { loginUser, extractUserInfoFromGoogle, error, setError } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginUser.mutateAsync(formData);
    } catch (err) {
      console.error("Login Error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuthSuccess = async (response: any) => {
    if (response.credential) {
      setLoading(true);

      const userInfo = extractUserInfoFromGoogle(response.credential);
      const formData = {
        email: userInfo?.email || "",
        uid: response.credential
      }

      try {
        await loginUser.mutateAsync(formData);
      } catch (err) {
        console.error("Login Error", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row lg:flex-row h-screen">
      <div className="relative w-full lg:w-1/2 h-64 md:h-full lg:h-full hidden md:block">
        <Image
          src="/assets/footer/get-started-background.jpeg"
          alt="Login Background"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="w-full lg:w-1/2 flex flex-col py-10 px-6 sm:px-10 justify-center bg-white">
        <div className="flex justify-center items-center mb-6">
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="assets/images/logo.png"
              alt="Company Logo"
              className="h-12 object-contain"
            />
          </Link>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Log In</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="info@grotn.com"
              value={formData.email}
              onChange={handleChange}
              className="block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-primary focus:border-primary sm:text-sm"
              required
            />
          </div>
          
          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-primary focus:border-primary sm:text-sm"
              required
            />
          </div>
  
          {/* Error Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
  
          {/* Submit Button */}
            <div className="flex flex-col justify-center items-center gap-2">
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#142329]"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
            <div className="flex items-center w-full my-4">
              <hr className="flex-grow border-t border-gray-300" />
              <span className="mx-2 text-gray-500">or</span>
              <hr className="flex-grow border-t border-gray-300" />
            </div>
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || ""}>
              <div className="w-full">
              <GoogleLogin
                onSuccess={handleGoogleAuthSuccess}
                onError={() => console.log("Google Login Failure")}
                useOneTap={ALLOW_ONE_TAP}
              /> 
              </div>
            </GoogleOAuthProvider>
            </div>
  
          {/* Registration Link */}
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              Are you a new user?{" "}
              <Link
                href="/sign-up"
                className="text-primary hover:underline hover:text-secondary font-medium"
              >
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
