'use client';

import { useState } from "react";

interface BudgetOnboardingCardProps {
    onSelectBudget: (minBudget: number, maxBudget: number) => void;
    onSkip?: () => void;
}

export function OnboardingBudgetCard({ onSelectBudget, onSkip }: BudgetOnboardingCardProps) {
    const [minBudget, setMinBudget] = useState(20);
    const [maxBudget, setMaxBudget] = useState(20000);
    const minLimit = 20;
    const maxLimit = 20000;

    const handleMinBudgetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value);
        if (value >= minLimit && value <= maxBudget - 100 && maxBudget - value >= 100) {
            setMinBudget(value);
        }
    };

    const handleMaxBudgetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value);
        if (value <= maxLimit && value >= minBudget + 100 && value - minBudget >= 100) {
            setMaxBudget(value);
        }
    };

    const handleContinue = () => {
        onSelectBudget(minBudget, maxBudget);
    };

    const getLeftPercentage = () => ((minBudget - minLimit) / (maxLimit - minLimit)) * 100;
    const getRightPercentage = () => ((maxBudget - minLimit) / (maxLimit - minLimit)) * 100;

    return (
        <div className="flex flex-col items-center p-4 sm:p-8 w-[90%] sm:w-[450px] mx-auto">
            <h2 className="mb-4 text-2xl sm:text-3xl font-bold text-text-primary">Set Your Budget</h2>
            <p className="text-gray-600 text-center mb-6 text-sm sm:text-base">Select a budget range that suits your needs.</p>

            <div className="w-full relative mb-6">
                <div className="relative w-full h-2 bg-gray-300 rounded-full">
                    <div
                        className="absolute h-2 bg-primary rounded-full"
                        style={{
                            left: `${getLeftPercentage()}%`,
                            width: `${getRightPercentage() - getLeftPercentage()}%`,
                        }}
                    ></div>
                </div>

                <input
                    type="range"
                    min={minLimit}
                    max={maxLimit}
                    step={20}
                    value={minBudget}
                    onChange={handleMinBudgetChange}
                    className="range-slider absolute w-full -top-2 h-6 cursor-pointer appearance-none bg-transparent"
                    style={{
                        pointerEvents: "none",
                        zIndex: 3,
                    }}
                />
                <input
                    type="range"
                    min={minLimit}
                    max={maxLimit}
                    step={20}
                    value={maxBudget}
                    onChange={handleMaxBudgetChange}
                    className="range-slider absolute w-full -top-2 h-6 cursor-pointer appearance-none bg-transparent"
                    style={{
                        pointerEvents: "none",
                        zIndex: 4,
                    }}
                />
            </div>

            <div className="flex justify-between w-full mb-4">
                <div className="flex items-center">
                    <span className="px-3 py-1 bg-gray-200 rounded-full text-xs sm:text-sm text-gray-700">{`Min: $${minBudget}`}</span>
                </div>
                <div className="flex items-center">
                    <span className="px-3 py-1 bg-gray-200 rounded-full text-xs sm:text-sm text-gray-700">{`Max: $${maxBudget}`}</span>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={handleContinue}
                    className="px-4 py-2 text-xs sm:text-sm bg-primary text-white rounded-md"
                >
                    Confirm Budget
                </button>
                {onSkip && (
                    <button
                        onClick={onSkip}
                        className="px-4 py-2 text-xs sm:text-sm bg-gray-200 text-gray-700 rounded-md"
                    >
                        Skip
                    </button>
                )}
            </div>
        </div>
    );
}