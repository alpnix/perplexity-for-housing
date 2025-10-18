'use client';

import { useState } from "react";
import { FaHome, FaUser, FaUsers, FaUserAlt, FaBeer, FaSmokingBan, FaSmoking } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { OnboardingCard } from "@/components/Onboarding/OnboardingCard";
import { OnboardingCityCard } from "@/components/Onboarding/OnboardingCityCard";
import { ApiResponse, CitySuggestion } from "@/types";
import { OnboardingBudgetCard } from "@/components/Onboarding/OnboardingBudgetCard";
import { OnboardingInterestCard } from "@/components/Onboarding/OnboardingInterestCard";
import { OnboardingDOBCard } from "@/components/Onboarding/OnboardingDOBCard";
import { OnboardingPhotoCard } from "@/components/Onboarding/OnboardingPhotoCard";
import { useFetch, useMutate } from "@/hooks/useAPiCall";
import { MdNoDrinks } from "react-icons/md";

const OnboardingPage = () => {
  const [step, setStep] = useState<number>(2);
  const [selectedData, setSelectedData] = useState<{
    openToRoommate?: boolean;
    drinks?: boolean;
    smokes?: boolean;
    gender?: "Male" | "Female" | "Other";
    city?: CitySuggestion;
    budget?: {
      min: number;
      max: number;
    };
    interests?: string[];
    dob?: string;
    profileImage?: string;
  }>({});
  const router = useRouter();

  const delayAndSetStep = (nextStep: number) => {
    setTimeout(() => setStep(nextStep), 500);
  };

  const handleSelectRole = async (role: string) => {
    delayAndSetStep(2);
  };

  const handleSelectDOB = (dob: string | undefined) => {
    setSelectedData((prevData) => ({ ...prevData, dob }));
    delayAndSetStep(3);
  };

  const handleSelectGender = (gender: "Male" | "Female" | "Other") => {
    setSelectedData((prevData) => ({ ...prevData, gender }));
    delayAndSetStep(4);
  };

  const handleSelectLivingPreference = (openToRoommate: boolean) => {
    setSelectedData((prevData) => ({ ...prevData, openToRoommate }));
    delayAndSetStep(6);
  };

  const handleSelectDrinkingPreference = (drinks: boolean) => {
    setSelectedData((prevData) => ({ ...prevData, drinks }));
    delayAndSetStep(7);
  };

  const handleSelectSmokingPreference = (smokes: boolean) => {
    setSelectedData((prevData) => ({ ...prevData, smokes }));
    delayAndSetStep(8);
  };

  const handleSelectCity = (city: CitySuggestion) => {
    setSelectedData((prevData) => ({ ...prevData, city }));
    delayAndSetStep(5);
  };

  const handleSelectBudget = (minBudget: number, maxBudget: number) => {
    setSelectedData((prevData) => ({ ...prevData, budget: { min: minBudget, max: maxBudget } }));
    delayAndSetStep(9);
  };

  const handleSelectInterests = async (interests: string[]) => {
    const updatedData = { ...selectedData, interests };
    setSelectedData(updatedData);
    delayAndSetStep(10);
  };

  const updateProfile = useMutate(
    async (profileData: typeof selectedData) => {
      const response = await useFetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/update`, "PUT", profileData);
      const result: ApiResponse<any> = await response.json();
      if (result.status !== 200) {
        throw new Error(result.message || "Profile update failed.");
      }
      return result.data;
    },
    {
      onSuccess: () => {
        router.push("/");
      },
      onError: (err: Error) => {
        console.error("Profile Update Error", err);
      },
    }
  );

  const handlePhotoSubmit = async (profileImage?: string) => {
    const updatedData = { ...selectedData, profileImage };
    setSelectedData(updatedData);
    await updateProfile.mutateAsync(updatedData);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 space-y-8">
      {step === 1 && (
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold text-gray-800">Continue Onboarding</h2>
          <p className="text-gray-600">GrotN is tenant-only for now.</p>
          <div className="flex flex-wrap justify-center space-x-4 md:space-x-8">
            <OnboardingCard
              title="Tenant"
              description="I am looking for a place to rent."
              icon={<FaUser />}
              isSelected={true}
              onClick={() => handleSelectRole("TENANT")}
            />
          </div>
        </div>
      )}
      {step === 2 && (
        <OnboardingDOBCard onSelectDob={handleSelectDOB} onSkip={() => delayAndSetStep(3)} />
      )}
      {step === 3 && (
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold text-gray-800">Gender</h2>
          <p className="text-gray-600">Select your gender.</p>
          <div className="flex flex-wrap justify-center space-x-4 md:space-x-8">
            <OnboardingCard
              title="Male"
              description="Identify as male."
              icon={<FaUser />}
              isSelected={selectedData.gender === "Male"}
              onClick={() => handleSelectGender("Male")}
            />
            <OnboardingCard
              title="Female"
              description="Identify as female."
              icon={<FaUserAlt />}
              isSelected={selectedData.gender === "Female"}
              onClick={() => handleSelectGender("Female")}
            />
            <OnboardingCard
              title="Other"
              description="Prefer another option."
              icon={<FaUsers />}
              isSelected={selectedData.gender === "Other"}
              onClick={() => handleSelectGender("Other")}
            />
          </div>
          <button onClick={() => delayAndSetStep(4)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">Skip</button>
        </div>
      )}
      {step === 4 && (
        <OnboardingCityCard onSelectCity={handleSelectCity} onSkip={() => delayAndSetStep(5)} />
      )}
      {step === 5 && (
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold text-gray-800">Living Preference</h2>
          <p className="text-gray-600">Are you open to living with roommates?</p>
          <div className="flex flex-wrap justify-center space-x-4 md:space-x-8">
            <OnboardingCard
              title="Yes"
              description="I am open to living with roommates."
              icon={<FaUsers />}
              isSelected={selectedData.openToRoommate === true}
              onClick={() => handleSelectLivingPreference(true)}
            />
            <OnboardingCard
              title="No"
              description="I prefer to live alone."
              icon={<FaUserAlt />}
              isSelected={selectedData.openToRoommate === false}
              onClick={() => handleSelectLivingPreference(false)}
            />
          </div>
          <button onClick={() => delayAndSetStep(6)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">Skip</button>
        </div>
      )}
      {step === 6 && (
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold text-gray-800">Drinking Preference</h2>
          <p className="text-gray-600">Do you drink alcohol?</p>
          <div className="flex flex-wrap justify-center space-x-4 md:space-x-8">
            <OnboardingCard
              title="Yes"
              description="I drink alcohol."
              icon={<FaBeer />}
              isSelected={selectedData.drinks === true}
              onClick={() => handleSelectDrinkingPreference(true)}
            />
            <OnboardingCard
              title="No"
              description="I do not drink alcohol."
              icon={<MdNoDrinks />}
              isSelected={selectedData.drinks === false}
              onClick={() => handleSelectDrinkingPreference(false)}
            />
          </div>
          <button onClick={() => delayAndSetStep(7)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">Skip</button>
        </div>
      )}
      {step === 7 && (
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold text-gray-800">Smoking Preference</h2>
          <p className="text-gray-600">Do you smoke?</p>
          <div className="flex flex-wrap justify-center space-x-4 md:space-x-8">
            <OnboardingCard
              title="Yes"
              description="I smoke."
              icon={<FaSmoking />}
              isSelected={selectedData.smokes === true}
              onClick={() => handleSelectSmokingPreference(true)}
            />
            <OnboardingCard
              title="No"
              description="I do not smoke."
              icon={<FaSmokingBan />}
              isSelected={selectedData.smokes === false}
              onClick={() => handleSelectSmokingPreference(false)}
            />
          </div>
          <button onClick={() => delayAndSetStep(8)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">Skip</button>
        </div>
      )}
      {step === 8 && (
        <OnboardingBudgetCard onSelectBudget={handleSelectBudget} onSkip={() => delayAndSetStep(9)} />
      )}
      {step === 9 && (
        <OnboardingInterestCard onSelectInterests={handleSelectInterests} onSkip={() => delayAndSetStep(10)} />
      )}
      {step === 10 && (
        <OnboardingPhotoCard onSubmit={handlePhotoSubmit} onSkip={() => handlePhotoSubmit(undefined)} />
      )}
    </div>
  );
};

export default OnboardingPage;
