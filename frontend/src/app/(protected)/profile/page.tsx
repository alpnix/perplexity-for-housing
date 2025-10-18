"use client";

import React, { useState, useEffect, useRef, FormEvent } from "react";
import useUserStore from "@/store/userStore";
import { useFetch, useMutate } from "@/hooks/useAPiCall";
import toast from "react-hot-toast";
import { UserProfileUpdateInput } from "@/types";
import { IoMdAdd } from "react-icons/io";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FaUsers, FaUserAlt, FaBeer, FaSmoking, FaSmokingBan } from "react-icons/fa";
import { MdNoDrinks } from "react-icons/md";
import { OnboardingCard } from "@/components/Onboarding/OnboardingCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const ProfileUpdate = () => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<UserProfileUpdateInput>({
    gender: undefined,
    openToRoommate: false,
    interests: [],
    budget: { min: 0, max: 0 },
    drinks: false,
    smokes: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newInterest, setNewInterest] = useState<string>("");
  const [cityText, setCityText] = useState<string>("");

  const predefinedInterests = [
    "Music", "Video Games", "Sports", "Technology", "Fitness",
    "Art", "Pets", "Languages", "Science", "Philosophy",
  ];

  const { data, error, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
        "GET",
        null
      );
      const result = await response.json();
      if (result.status !== 200 || !result.data) {
        throw new Error(result.message || "Failed to fetch profile");
      }
      return result.data;
    },
  });

  useEffect(() => {
    if (data) {
      const safeImage = data.tenantProfile?.profileImage
        ? data.tenantProfile.profileImage
        : typeof data.user.image === "string" &&
          (data.user.image.startsWith("http") || data.user.image.startsWith("data:"))
        ? data.user.image
        : undefined;
      setUser({ ...data.user, image: safeImage });
      if (data.tenantProfile) {
        setFormData({
          city: data.tenantProfile.city || undefined,
          dob: data.tenantProfile.dob || undefined,
          gender:
            data.tenantProfile.gender === "Male" ||
            data.tenantProfile.gender === "Female" ||
            data.tenantProfile.gender === "Other"
              ? (data.tenantProfile.gender as "Male" | "Female" | "Other")
              : undefined,
          openToRoommate: data.tenantProfile.openToRoommate || false,
          interests: data.tenantProfile.interests || [],
          budget: data.tenantProfile.budget || { min: 0, max: 0 },
          drinks: data.tenantProfile.drinks || false,
          smokes: data.tenantProfile.smokes || false,
          profileImage: data.tenantProfile.profileImage || undefined,
        });
        setCityText(data.tenantProfile.city?.description || "");
      }
    }
  }, [data, setUser]);

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/auth");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const updateProfile = useMutate(
    async (data: UserProfileUpdateInput) => {
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile/update`,
        "PUT",
        data
      );
      const result = await response.json();
      if (result.status !== 200) {
        throw new Error(result.message || "Failed to update profile");
      }
      return result;
    },
    {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        if (formData.profileImage) {
          setUser({ ...(user || {}), image: formData.profileImage });
        }
        router.push("/");
      },
      onError: (err: Error) => toast.error(err.message),
    }
  );

  // Removed separate upload endpoint; we send base64 in profile update

  useEffect(() => {
    if (cityInputRef.current && window.google) {
      const autoCompleteInstance = new window.google.maps.places.Autocomplete(
        cityInputRef.current,
        { types: ["(cities)"] }
      );
      autoCompleteInstance.addListener("place_changed", () => {
        const place = autoCompleteInstance.getPlace();
        if (place && place.formatted_address && place.place_id) {
          setCityText(place.formatted_address);
          setFormData((prev) => ({
            ...prev,
            city: {
              description: place.formatted_address!,
              place_id: place.place_id!,
            },
          }));
        }
      });
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (name === "budgetMin") {
      setFormData({
        ...formData,
        budget: { ...formData.budget!, min: Number(value) },
      });
    } else if (name === "budgetMax") {
      setFormData({
        ...formData,
        budget: { ...formData.budget!, max: Number(value) },
      });
    } else if (name === "gender") {
      setFormData({ ...formData, gender: value ? (value as any) : undefined });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests!.includes(interest)
        ? prev.interests!.filter((i) => i !== interest)
        : [...prev.interests!, interest],
    }));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests!.includes(newInterest)) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests!, newInterest],
      }));
      setNewInterest("");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (result && result.startsWith("data:image/")) {
          setFormData({ ...formData, profileImage: result });
        } else {
          toast.error("Please select a valid image file");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload: UserProfileUpdateInput = { ...formData };
    if (payload.gender && !["Male", "Female", "Other"].includes(payload.gender)) {
      delete (payload as any).gender;
    }
    if (!payload.dob) {
      delete (payload as any).dob;
    }
    if (!payload.city || !payload.city.place_id || !payload.city.description) {
      delete (payload as any).city;
    }
    await updateProfile.mutateAsync(payload);
  };

  // No-op; image is included in profile update payload

  const allInterests = Array.from(
    new Set([...predefinedInterests, ...(formData.interests || [])])
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center space-x-3 rounded-md bg-white px-4 py-3 shadow-sm border border-gray-200">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          <span className="text-sm text-gray-700">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {updateProfile.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex items-center space-x-3 rounded-md bg-white px-4 py-3 shadow-lg">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
            <span className="text-sm text-gray-700">Updating profile...</span>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Profile Picture Section */}
          <Card className="p-4 text-center">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <div className="mb-4">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto object-cover"
                />
              ) : user?.image ? (
                <img
                  src={user.image}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image</span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-text-secondary hover:file:bg-primary-dark"
            />
            {/* Upload button removed; image is sent with Update Profile */}
          </Card>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <Card className="p-4">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    ref={cityInputRef}
                    value={cityText}
                    onChange={(e) => setCityText(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter address..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Date of Birth
                  </label>
                  <DatePicker
                    selected={formData.dob ? new Date(formData.dob) : null}
                    onChange={(date: Date | null) =>
                      setFormData({
                        ...formData,
                        dob: date
                          ? date.toLocaleDateString("en-US", {
                              month: "2-digit",
                              day: "2-digit",
                              year: "numeric",
                            })
                          : undefined,
                      })
                    }
                    dateFormat="MM/dd/yyyy"
                    className="block w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                    placeholderText="Select date"
                    maxDate={new Date()}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Preferences Section */}
            <Card className="p-4">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    Open to Roommate
                  </label>
                  <div className="flex space-x-4">
                    <OnboardingCard
                      title="Yes"
                      description="I am open to living with roommates."
                      icon={<FaUsers />}
                      isSelected={formData.openToRoommate === true}
                      onClick={() => setFormData({ ...formData, openToRoommate: true })}
                    />
                    <OnboardingCard
                      title="No"
                      description="I prefer to live alone."
                      icon={<FaUserAlt />}
                      isSelected={formData.openToRoommate === false}
                      onClick={() => setFormData({ ...formData, openToRoommate: false })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Interests
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {allInterests.map((interest) => (
                      <div
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1 text-sm font-medium rounded-full cursor-pointer transition-colors ${
                          formData.interests?.includes(interest)
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                      placeholder="Add a new interest"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInterest();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddInterest}
                      className="px-4 py-2 bg-primary text-text-secondary rounded-md hover:bg-primary-dark transition-colors"
                    >
                      <IoMdAdd size={20} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Budget Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="budgetMin"
                      value={formData.budget?.min || 0}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      name="budgetMax"
                      value={formData.budget?.max || 0}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Lifestyle Section */}
            <Card className="p-4">
              <CardHeader>
                <CardTitle>Lifestyle</CardTitle>
              </CardHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    Drinks
                  </label>
                  <div className="flex space-x-4">
                    <OnboardingCard
                      title="Yes"
                      description="I drink alcohol."
                      icon={<FaBeer />}
                      isSelected={formData.drinks === true}
                      onClick={() => setFormData({ ...formData, drinks: true })}
                    />
                    <OnboardingCard
                      title="No"
                      description="I do not drink alcohol."
                      icon={<MdNoDrinks />}
                      isSelected={formData.drinks === false}
                      onClick={() => setFormData({ ...formData, drinks: false })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    Smokes
                  </label>
                  <div className="flex space-x-4">
                    <OnboardingCard
                      title="Yes"
                      description="I smoke."
                      icon={<FaSmoking />}
                      isSelected={formData.smokes === true}
                      onClick={() => setFormData({ ...formData, smokes: true })}
                    />
                    <OnboardingCard
                      title="No"
                      description="I do not smoke."
                      icon={<FaSmokingBan />}
                      isSelected={formData.smokes === false}
                      onClick={() => setFormData({ ...formData, smokes: false })}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <button
              type="submit"
              disabled={updateProfile.isPending}
              className={`w-full px-4 py-2 rounded-md transition-colors text-text-secondary ${
                updateProfile.isPending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dark"
              }`}
            >
              {updateProfile.isPending ? (
                <span className="inline-flex items-center justify-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-white" />
                  Saving...
                </span>
              ) : (
                "Update Profile"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProfileUpdate;