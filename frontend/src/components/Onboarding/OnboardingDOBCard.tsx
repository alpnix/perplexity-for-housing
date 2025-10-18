"use client";

import React, { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const FormSchema = z.object({
    dob: z.date({
        required_error: "A date of birth is required.",
    }),
});

interface OnboardingDOBCardProps {
    onSelectDob: (dob: string | undefined) => void;
    onSkip?: () => void;
}

export function OnboardingDOBCard({ onSelectDob, onSkip }: OnboardingDOBCardProps) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        onSelectDob(format(data.dob, "MM/dd/yyyy"));
    }

    const today = new Date();
    const initialMonth = form.getValues("dob") || new Date("2000-01-01");
    const [visibleMonth, setVisibleMonth] = useState<Date>(initialMonth);
    const [showYearGrid, setShowYearGrid] = useState<boolean>(false);

    const currentYear = visibleMonth.getFullYear();
    const { decadeStart, years } = useMemo(() => {
        const start = Math.floor(currentYear / 12) * 12; // 12-year grid
        return {
            decadeStart: start,
            years: Array.from({ length: 12 }, (_, i) => start + i),
        };
    }, [currentYear]);

    const minYear = 1900;
    const maxYear = today.getFullYear();

    const goPrevBlock = () => {
        const newStartYear = Math.max(minYear, decadeStart - 12);
        setVisibleMonth(new Date(newStartYear, visibleMonth.getMonth(), 1));
    };
    const goNextBlock = () => {
        const newStartYear = Math.min(maxYear, decadeStart + 12);
        setVisibleMonth(new Date(newStartYear, visibleMonth.getMonth(), 1));
    };
    const selectYear = (year: number) => {
        const clampedYear = Math.min(Math.max(year, minYear), maxYear);
        setVisibleMonth(new Date(clampedYear, visibleMonth.getMonth(), 1));
        setShowYearGrid(false);
    };

    return (
        <div className="flex flex-col items-center space-y-4 px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center">Select Your Date of Birth</h2>
            <p className="text-gray-600 text-center mb-6">
                We use this data to provide you with a better experience.
            </p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                            <FormItem className="flex flex-col items-center">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "MM/dd/yyyy")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent side="bottom" align="start" sideOffset={8} avoidCollisions={false} className="w-auto p-0 bg-white">
                                        {/* Header with Year picker toggle */}
                                        <div className="flex items-center justify-between px-3 pt-3">
                                            <div className="text-sm font-medium">{visibleMonth.toLocaleString(undefined, { month: "long", year: "numeric" })}</div>
                                            <button
                                                type="button"
                                                onClick={() => setShowYearGrid((v) => !v)}
                                                className="text-xs text-primary underline hover:opacity-80"
                                            >
                                                {showYearGrid ? "Close years" : "Select year"}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Calendar
                                                mode="single"
                                                month={visibleMonth}
                                                onMonthChange={setVisibleMonth}
                                                selected={field.value || new Date("2000-01-01")}
                                                onSelect={(date) => field.onChange(date ? new Date(date) : date)}
                                                disabled={(date) =>
                                                    date > today || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />

                                            {showYearGrid && (
                                                <div className="absolute inset-0 bg-white/95 p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <button type="button" onClick={goPrevBlock} className="p-1 rounded hover:bg-gray-100">
                                                            <ChevronLeft className="h-4 w-4" />
                                                        </button>
                                                        <div className="text-sm font-medium">{decadeStart} – {Math.min(decadeStart + 11, maxYear)}</div>
                                                        <button type="button" onClick={goNextBlock} className="p-1 rounded hover:bg-gray-100">
                                                            <ChevronRight className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {years.map((y) => {
                                                            const disabled = y < minYear || y > maxYear;
                                                            const active = y === currentYear;
                                                            return (
                                                                <button
                                                                    key={y}
                                                                    type="button"
                                                                    disabled={disabled}
                                                                    onClick={() => selectYear(y)}
                                                                    className={cn(
                                                                        "py-2 text-sm rounded border transition-colors",
                                                                        disabled && "opacity-40 cursor-not-allowed",
                                                                        active ? "bg-primary text-white border-primary" : "hover:bg-gray-100 border-gray-200"
                                                                    )}
                                                                >
                                                                    {y}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-center gap-3">
                        <Button type="submit" className="bg-primary text-white">Submit</Button>
                        {onSkip && (
                          <Button type="button" variant="outline" onClick={onSkip}>Skip</Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
}
