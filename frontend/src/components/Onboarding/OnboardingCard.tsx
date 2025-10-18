import * as React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OnboardingCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
}

export function OnboardingCard({
    title,
    description,
    icon,
    isSelected,
    onClick,
}: OnboardingCardProps) {
    return (
        <Card
            className={`
                w-full sm:w-[260px] h-[320px] cursor-pointer p-4 border-2 rounded-lg shadow-md transition-all duration-300 ease-in-out flex flex-col items-center relative
                ${isSelected ? "border-primary bg-primary/10 scale-105 text-primary" : "border-gray-300 hover:shadow-lg hover:scale-105 grayscale hover:grayscale-0"}
            `}
            onClick={onClick}
        >
            {isSelected && (
                <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="absolute top-2 right-2 form-checkbox h-4 w-4 text-primary rounded-full focus:outline-none focus:ring-primary"
                />
            )}
            <div className="flex flex-col items-center space-y-2">
                <div className={`transition-colors duration-300 text-6xl mb-4 ${
                        isSelected ? "text-primary" : "text-gray-500"
                    } `}>{icon}</div>
                <CardHeader className="text-center">
                    <CardTitle className="text-lg font-bold">{title}</CardTitle>
                    <CardDescription className="text-sm mt-1">{description}</CardDescription>
                </CardHeader>
            </div>
        </Card>
    );
}
