import { useState } from "react";
import { useFetch, useMutate } from "@/hooks/useAPiCall";
import toast from "react-hot-toast";
import { ApiResponse, RecommendedRoommateResponse, Roommate, RoommateByStatusResponse, StatusUpdateData, TenantProfileDocument, UserDocument } from "@/types";

type RoommateStatus = "recommended" | "pending" | "accepted" | "not-interested";

export const useRoommates = () => {
  const [error, setError] = useState<string | null>(null);
  const [roommates, setRoommates] = useState<Roommate[]>([]);

  const normalizeRoommateData = (
    data: RecommendedRoommateResponse | RoommateByStatusResponse
  ): Roommate => {
    const user = data.user;
    const profile = "tenantProfile" in data ? data.tenantProfile : null;
    return {
      id: user._id || "",
      name: `${user.firstname} ${user.lastname}`,
      location: profile?.city?.description || "Unknown location",
      description: profile?.interests?.join(", ") || "No description",
      gender: profile?.gender || "Unknown",
      hobbies: profile?.interests || [],
      status:
        "connectionStatus" in data ? data.connectionStatus : "recommended",
      image: user.image || undefined,
      requestInitiator:
        "requestInitiator" in data ? data.requestInitiator : null,
    };
  };

  const fetchRecommendedRoommates = useMutate(
    async () => {
      const [recommendedRes, interestsRes] = await Promise.all([
        useFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/roommates/recommended`,
          "GET",
          null
        ),
        useFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/roommates/interests`,
          "GET",
          null
        ),
      ]);

      const recommendedResult: ApiResponse<RecommendedRoommateResponse[]> =
        await recommendedRes.json();
      if (recommendedResult.status !== 200 || !recommendedResult.data) {
        throw new Error(
          recommendedResult.message || "Failed to fetch recommended roommates."
        );
      }

      const interestsResult: ApiResponse<any[]> = await interestsRes.json();
      const recommended = recommendedResult.data.map(normalizeRoommateData);

      if (interestsResult?.status === 200 && Array.isArray(interestsResult.data)) {
        const recipientIds = new Set(
          interestsResult.data
            .map((i: any) =>
              typeof i?.recipient === "string" ? i.recipient : i?.recipient?._id
            )
            .filter(Boolean)
        );
        return recommended.filter((r) => !recipientIds.has(r.id));
      }

      return recommended;
    },
    {
      onSuccess: (data: Roommate[]) => {
        setRoommates(data);
        toast.success("Recommended roommates loaded successfully!");
      },
      onError: (err: Error) => {
        console.error("Fetch Recommended Roommates Error", err);
        toast.error(err.message);
        setError(err.message);
      },
    }
  );

  const updateRoommateStatus = useMutate(
    async (data: StatusUpdateData) => {
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/roommates/status`,
        "PUT",
        data
      );
      const result: ApiResponse<any> = await response.json();
      if (result.status !== 200 || !result.data) {
        throw new Error(result.message || "Failed to update roommate status.");
      }
      return result.data;
    },
    {
      onSuccess: async () => {
        toast.success("Roommate status updated successfully!");
      },
      onError: (err: Error) => {
        console.error("Update Roommate Status Error", err);
        toast.error(err.message);
        setError(err.message);
      },
    }
  );
  

  const fetchRoommatesByStatus = useMutate(
    async (status: RoommateStatus) => {
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/roommates/status/${status}`,
        "GET",
        null
      );
      const result: ApiResponse<RoommateByStatusResponse[]> =
        await response.json();
      if (result.status !== 200 || !result.data) {
        throw new Error(
          result.message || "Failed to fetch roommates by status."
        );
      }
      return result.data.map(normalizeRoommateData);
    },
    {
      onSuccess: (data: Roommate[]) => {
        setRoommates(data);
        toast.success(
          `Roommates with status ${data[0]?.status || "unknown"} loaded successfully!`
        );
      },
      onError: (err: Error) => {
        console.error("Fetch Roommates By Status Error", err);
        toast.error(err.message);
        setError(err.message);
      },
    }
  );

  const uploadProfileImage = useMutate(
    async (formData: FormData) => {
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/upload-image`,
        "POST",
        formData,
        {
          "Content-Type": "multipart/form-data",
        }
      );
      const result: ApiResponse<{ image: string }> = await response.json();
      if (result.status !== 200 || !result.data) {
        throw new Error(result.message || "Failed to upload profile image.");
      }
      return result.data;
    },
    {
      onSuccess: (data: { image: string }) => {
        toast.success("Profile image uploaded successfully!");
      },
      onError: (err: Error) => {
        console.error("Upload Profile Image Error", err);
        toast.error(err.message);
        setError(err.message);
      },
    }
  );

  return {
    roommates,
    fetchRecommendedRoommates,
    updateRoommateStatus,
    fetchRoommatesByStatus,
    uploadProfileImage,
    error,
    setError,
    setRoommates,
  };
};
