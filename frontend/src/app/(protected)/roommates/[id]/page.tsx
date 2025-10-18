"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useAPiCall";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

type PublicProfile = {
  user: {
    _id: string;
    firstname: string;
    lastname: string;
    image?: string;
  };
  tenantProfile: {
    city?: { description: string; place_id: string };
    gender?: string;
    interests?: string[];
    budget?: { min: number; max: number };
    drinks?: boolean;
    smokes?: boolean;
    profileImage?: string;
    dob?: string;
    openToRoommate?: boolean;
  } | null;
};

export default function RoommateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [data, setData] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const resp = await useFetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/${userId}`, "GET", null);
        const result = await resp.json();
        if (result.status !== 200 || !result.data) {
          throw new Error(result.message || "Failed to load profile");
        }
        setData(result.data as PublicProfile);
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    if (userId) run();
  }, [userId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex items-center space-x-3 rounded-md bg-white px-4 py-3 shadow-sm border border-gray-200">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
        <span className="text-sm text-gray-700">Loading profile...</span>
      </div>
    </div>

    );
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8">No data.</div>;

  const avatar = data.tenantProfile?.profileImage || data.user.image;
  const name = `${data.user.firstname} ${data.user.lastname}`;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Card className="p-4 text-center">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <div className="mb-4">
            {avatar ? (
              <img src={avatar} alt="Profile" className="w-32 h-32 rounded-full mx-auto object-cover" />
            ) : (
              <div className="w-32 h-32 rounded-full mx-auto bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image</span>
              </div>
            )}
          </div>
          <div className="text-2xl font-semibold text-gray-900">{name}</div>
          <div className="text-gray-600">{data.tenantProfile?.city?.description || ""}</div>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <div className="text-sm text-gray-700"><span className="font-medium">Gender:</span> {data.tenantProfile?.gender || "Unknown"}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Budget:</span> {data.tenantProfile?.budget ? `$${data.tenantProfile.budget.min} - $${data.tenantProfile.budget.max}` : "N/A"}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Drinks:</span> {data.tenantProfile?.drinks ? "Yes" : "No"}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Smokes:</span> {data.tenantProfile?.smokes ? "Yes" : "No"}</div>
            {Array.isArray(data.tenantProfile?.interests) && data.tenantProfile?.interests?.length ? (
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Interests</div>
                <div className="flex flex-wrap gap-2">
                  {data.tenantProfile!.interests!.map((i) => (
                    <span key={i} className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}


