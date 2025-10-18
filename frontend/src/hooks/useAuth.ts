import { useState } from "react";
import { useFetch, useMutate } from "@/hooks/useAPiCall";
import useUserStore from "@/store/userStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ApiResponse, AuthFormData, AuthResponse, DecodedToken, UserProfile } from "@/types";
import { jwtDecode } from "jwt-decode";



export const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();

  const fetchProfile = async (): Promise<UserProfile> => {
    try {
      const response = await useFetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, "GET", null);
      const result: ApiResponse<UserProfile> = await response.json();
      if (result.status !== 200 || !result.data) {
        throw new Error(result.message || "Failed to fetch user profile.");
      }
      return result.data;
    } catch (err) {
      throw new Error("Error fetching profile: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const extractUserInfoFromGoogle = (credential: string) => {
    try {
      const decodedToken: DecodedToken = jwtDecode(credential);
      return {
        email: decodedToken.email,
        name: decodedToken.name,
      };
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const handleAuthSuccess = async () => {
    try {
      const profileData = await fetchProfile();
      const mergedUser = {
        ...profileData.user,
        image: profileData.tenantProfile?.profileImage || profileData.user.image,
      };
      setUser(mergedUser);
      toast.success("Welcome back!");
      // Redirect based on existence of tenant profile
      if (!profileData.tenantProfile) {
        router.push("/onboarding");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Profile Fetch Error", err);
      toast.error("Failed to fetch user profile. Please try again.");
      setError("Failed to fetch user profile.");
    }
  };

  const registerUser = useMutate(
    async (formData: AuthFormData) => {
      const response = await useFetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, "POST", formData);
      const result: ApiResponse<AuthResponse> = await response.json();
      if (result.status !== 200 || !result.data) {
        throw new Error(result.message || "Registration failed.");
      }
      return result.data;
    },
    {
      onSuccess: async ({ token }) => {
        token = token.replace(/^"(.*)"$/, "$1");
        document.cookie = `token=${token}; path=/;`;
        try { localStorage.setItem('token', token); } catch {}
        await handleAuthSuccess();
      },
      onError: (err: Error) => {
        console.error("Registration Error", err);
        toast.error(err.message);
        setError(err.message);
      },
    }
  );

  const loginUser = useMutate(
    async (formData: AuthFormData) => {
      const response = await useFetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, "POST", formData);
      const result: ApiResponse<AuthResponse> = await response.json();
      if (result.status !== 200 || !result.data) {
        throw new Error(result.message || "Login failed.");
      }
      return result.data;
    },
    {
      onSuccess: async ({ token }) => {
        document.cookie = `token=${token}; path=/;`;
        try { localStorage.setItem('token', token); } catch {}
        await handleAuthSuccess();
      },
      onError: (err: Error) => {
        console.error("Login Error", err);
        toast.error(err.message);
        setError(err.message);
      },
    }
  );

  return { registerUser, extractUserInfoFromGoogle, loginUser, error, setError };
};