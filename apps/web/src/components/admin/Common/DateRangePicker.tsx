"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    X,
    Check,
    Clock,
    TrendingUp,
    RotateCcw
} from "lucide-react";

// Date range presets
export interface DateRangePreset {
    label: string;
    value: string;
    startDate: Date;
    endDate: Date;
    icon?: React.ReactNode;
    description?: string;
}

export interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

export interface DateRangePickerProps {
    // Value and change handling
    value?: DateRange;
    onChange: (range: DateRange) => void;
    onClose?: () => void;

    // Configuration
    placeholder?: string;
    format?: 'short' | 'medium' | 'long';
    showPresets?: boolean;
    showTime?: boolean;
    maxDate?: Date;
    minDate?: Date;

    // Custom presets
    customPresets?: DateRangePreset[];

    // UI customization
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'compact' | 'inline';
    showClearButton?: boolean;
    showApplyButton?: boolean;
    className?: string;

    // Behavior
    closeOnSelect?: boolean;
    allowSingleDate?: boolean;
    highlightToday?: boolean;
    weekStartsOn?: 0 | 1; // 0 = Sunday, 1 = Monday
}

// Default presets for common business date ranges
const defaultPresets: DateRangePreset[] = [
    {
        label: "Today",
        value: "today",
        startDate: new Date(),
        endDate: new Date(),
        icon: <Clock size={16} />,
        description: "Current day"
    },
    {
        label: "Yesterday",
        value: "yesterday",
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        icon: <Clock size={16} />,
        description: "Previous day"
    },
    {
        label: "Last 7 Days",
        value: "last7days",
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        icon: <TrendingUp size={16} />,
        description: "Past week"
    },
    {
        label: "Last 30 Days",
        value: "last30days",
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        icon: <TrendingUp size={16} />,
        description: "Past month"
    },
    {
        label: "This Month",
        value: "thismonth",
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date(),
        icon: <Calendar size={16} />,
        description: "Current month to date"
    },
    {
        label: "Last Month",
        value: "lastmonth",
        startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
        icon: <Calendar size={16} />,
        description: "Previous month"
    },
    {
        label: "This Quarter",
        value: "thisquarter",
        startDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1),
        endDate: new Date(),
        icon: <TrendingUp size={16} />,
        description: "Current quarter to date"
    },
    {
        label: "This Year",
        value: "thisyear",
        startDate: new Date(new Date().getFullYear(), 0, 1),
        endDate: new Date(),
        icon: <Calendar size={16} />,
        description: "Current year to date"
    }
];

export default function DateRangePicker({
    value,
    onChange,
    onClose,
    placeholder = "Select date range",
    format = 'medium',
    showPresets = true,
    showTime = false,
    maxDate,
    minDate,
    customPresets,
    size = 'md',
    variant = 'default',
    showClearButton = true,
    showApplyButton = false,
    className = "",
    closeOnSelect = false,
    allowSingleDate = true,
    highlightToday = true,
    weekStartsOn = 1
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedRange, setSelectedRange] = useState<DateRange>(
        value || { startDate: null, endDate: null }
    );
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [selectingEnd, setSelectingEnd] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const presets = customPresets || defaultPresets;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (isOpen) {
                    handleClose();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Sync internal state with external value
    useEffect(() => {
        if (value) {
            setSelectedRange(value);
        }
    }, [value]);

    const formatDate = (date: Date | null, formatType = format): string => {
        if (!date) return '';

        const options: Intl.DateTimeFormatOptions = {
            year: formatType === 'short' ? '2-digit' : 'numeric',
            month: formatType === 'short' ? 'short' : formatType === 'medium' ? 'short' : 'long',
            day: 'numeric',
            ...(showTime && {
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        return date.toLocaleDateString('en-US', options);
    };

    const getDisplayValue = (): string => {
        if (!selectedRange.startDate && !selectedRange.endDate) {
            return placeholder;
        }

        if (selectedRange.startDate && !selectedRange.endDate) {
            return formatDate(selectedRange.startDate);
        }

        if (selectedRange.startDate && selectedRange.endDate) {
            const start = formatDate(selectedRange.startDate);
            const end = formatDate(selectedRange.endDate);

            if (selectedRange.startDate.toDateString() === selectedRange.endDate.toDateString()) {
                return start;
            }

            return `${start} - ${end}`;
        }

        return placeholder;
    };

    const handleDateClick = (date: Date) => {
        if (!selectedRange.startDate || (selectedRange.startDate && selectedRange.endDate)) {
            // Start new selection
            const newRange = { startDate: date, endDate: null };
            setSelectedRange(newRange);
            setSelectingEnd(true);

            if (allowSingleDate && closeOnSelect) {
                onChange(newRange);
                handleClose();
            }
        } else if (selectedRange.startDate && !selectedRange.endDate) {
            // Complete the range
            const startDate = selectedRange.startDate;
            const endDate = date;

            const newRange = {
                startDate: startDate <= endDate ? startDate : endDate,
                endDate: startDate <= endDate ? endDate : startDate
            };

            setSelectedRange(newRange);
            setSelectingEnd(false);

            if (closeOnSelect) {
                onChange(newRange);
                handleClose();
            }
        }
    };

    const handlePresetClick = (preset: DateRangePreset) => {
        const newRange = {
            startDate: preset.startDate,
            endDate: preset.endDate
        };

        setSelectedRange(newRange);
        setSelectingEnd(false);

        if (closeOnSelect) {
            onChange(newRange);
            handleClose();
        }
    };

    const handleApply = () => {
        onChange(selectedRange);
        handleClose();
    };

    const handleClear = () => {
        const newRange = { startDate: null, endDate: null };
        setSelectedRange(newRange);
        onChange(newRange);
        setSelectingEnd(false);
    };

    const handleClose = () => {
        setIsOpen(false);
        setHoverDate(null);
        onClose?.();
    };

    const isDateInRange = (date: Date): boolean => {
        if (!selectedRange.startDate) return false;

        if (selectingEnd && hoverDate) {
            const start = selectedRange.startDate;
            const end = hoverDate;
            const rangeStart = start <= end ? start : end;
            const rangeEnd = start <= end ? end : start;
            return date >= rangeStart && date <= rangeEnd;
        }

        if (selectedRange.endDate) {
            return date >= selectedRange.startDate && date <= selectedRange.endDate;
        }

        return false;
    };

    const isDateSelected = (date: Date): boolean => {

        const isStartDate = selectedRange?.startDate && date.toDateString() === selectedRange?.startDate.toDateString();
        const isEndDate = selectedRange?.endDate && date.toDateString() === selectedRange?.endDate.toDateString();

        return !!isStartDate || !!isEndDate;
    };

    const isDateDisabled = (date: Date): boolean => {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        return false;
    };

    const isToday = (date: Date): boolean => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Generate calendar days
    const generateCalendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Adjust first day based on week start preference
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - ((firstDay.getDay() - weekStartsOn + 7) % 7));

        const days: Date[] = [];
        const current = new Date(startDate);

        // Generate 6 weeks of days
        for (let i = 0; i < 42; i++) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return days;
    }, [currentMonth, weekStartsOn]);

    const weekDays = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        if (weekStartsOn === 1) {
            return [...days.slice(1), days[0]];
        }
        return days;
    }, [weekStartsOn]);

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev);
            if (direction === 'prev') {
                newMonth.setMonth(newMonth.getMonth() - 1);
            } else {
                newMonth.setMonth(newMonth.getMonth() + 1);
            }
            return newMonth;
        });
    };

    const sizeClasses = {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg'
    };

    const dropdownVariants = {
        hidden: {
            opacity: 0,
            scale: 0.95,
            y: -10
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.2,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: -10,
            transition: {
                duration: 0.15
            }
        }
    };

    const hasValue = selectedRange.startDate || selectedRange.endDate;

    if (variant === 'inline') {
        return (
            <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}>
                <CalendarGrid
                    currentMonth={currentMonth}
                    onNavigateMonth={navigateMonth}
                    days={generateCalendarDays}
                    weekDays={weekDays}
                    onDateClick={handleDateClick}
                    onDateHover={setHoverDate}
                    isDateInRange={isDateInRange}
                    isDateSelected={isDateSelected}
                    isDateDisabled={isDateDisabled}
                    isToday={isToday}
                    highlightToday={highlightToday}
                    showPresets={showPresets}
                    presets={presets}
                    onPresetClick={handlePresetClick}
                    selectedRange={selectedRange}
                    onClear={handleClear}
                    onApply={handleApply}
                    showClearButton={showClearButton}
                    showApplyButton={showApplyButton}
                />
            </div>
        );
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          ${sizeClasses[size]}
          w-full flex items-center justify-between
          border border-gray-300 dark:border-gray-600 
          bg-white dark:bg-gray-800 
          rounded-lg 
          text-left 
          transition-all duration-200
          hover:border-gold
          focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent
          ${hasValue ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}
          ${isOpen ? 'border-gold ring-2 ring-gold/20' : ''}
        `}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{getDisplayValue()}</span>
                </div>

                <div className="flex items-center gap-1 ml-2">
                    {hasValue && showClearButton && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                            <X size={14} className="text-gray-400" />
                        </button>
                    )}
                    <Calendar size={16} className="text-gray-400" />
                </div>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute top-full left-0 z-50 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl"
                        style={{ minWidth: '320px' }}
                    >
                        <CalendarGrid
                            currentMonth={currentMonth}
                            onNavigateMonth={navigateMonth}
                            days={generateCalendarDays}
                            weekDays={weekDays}
                            onDateClick={handleDateClick}
                            onDateHover={setHoverDate}
                            isDateInRange={isDateInRange}
                            isDateSelected={isDateSelected}
                            isDateDisabled={isDateDisabled}
                            isToday={isToday}
                            highlightToday={highlightToday}
                            showPresets={showPresets}
                            presets={presets}
                            onPresetClick={handlePresetClick}
                            selectedRange={selectedRange}
                            onClear={handleClear}
                            onApply={handleApply}
                            showClearButton={showClearButton}
                            showApplyButton={showApplyButton}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Calendar Grid Component
interface CalendarGridProps {
    currentMonth: Date;
    onNavigateMonth: (direction: 'prev' | 'next') => void;
    days: Date[];
    weekDays: string[];
    onDateClick: (date: Date) => void;
    onDateHover: (date: Date | null) => void;
    isDateInRange: (date: Date) => boolean;
    isDateSelected: (date: Date) => boolean;
    isDateDisabled: (date: Date) => boolean;
    isToday: (date: Date) => boolean;
    highlightToday: boolean;
    showPresets: boolean;
    presets: DateRangePreset[];
    onPresetClick: (preset: DateRangePreset) => void;
    selectedRange: DateRange;
    onClear: () => void;
    onApply: () => void;
    showClearButton: boolean;
    showApplyButton: boolean;
}

function CalendarGrid({
    currentMonth,
    onNavigateMonth,
    days,
    weekDays,
    onDateClick,
    onDateHover,
    isDateInRange,
    isDateSelected,
    isDateDisabled,
    isToday,
    highlightToday,
    showPresets,
    presets,
    onPresetClick,
    selectedRange,
    onClear,
    onApply,
    showClearButton,
    showApplyButton
}: CalendarGridProps) {
    return (
        <div className="flex">
            {/* Presets Sidebar */}
            {showPresets && (
                <div className="w-48 border-r border-gray-200 dark:border-gray-700 p-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Quick Select
                    </h4>
                    <div className="space-y-1">
                        {presets.map((preset) => (
                            <button
                                key={preset.value}
                                onClick={() => onPresetClick(preset)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                            >
                                {preset.icon}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium">{preset.label}</div>
                                    {preset.description && (
                                        <div className="text-xs text-gray-500 truncate">
                                            {preset.description}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Calendar */}
            <div className="p-4 min-w-80">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => onNavigateMonth('prev')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>

                    <button
                        onClick={() => onNavigateMonth('next')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Week Days */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day) => (
                        <div
                            key={day}
                            className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                    {days.map((day, index) => {
                        const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                        const inRange = isDateInRange(day);
                        const selected = isDateSelected(day);
                        const disabled = isDateDisabled(day);
                        const today = isToday(day);

                        return (
                            <button
                                key={index}
                                onClick={() => !disabled && onDateClick(day)}
                                onMouseEnter={() => onDateHover(day)}
                                onMouseLeave={() => onDateHover(null)}
                                disabled={disabled}
                                className={`
                  h-8 w-8 flex items-center justify-center text-sm rounded transition-all duration-150
                  ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : ''}
                  ${disabled ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'cursor-pointer'}
                  ${selected ? 'bg-gold text-black font-medium' : ''}
                  ${inRange && !selected ? 'bg-gold/20 text-gold' : ''}
                  ${today && highlightToday && !selected && !inRange ? 'ring-2 ring-gold/50' : ''}
                  ${!disabled && !selected && !inRange ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : ''}
                `}
                            >
                                {day.getDate()}
                            </button>
                        );
                    })}
                </div>

                {/* Action Buttons */}
                {(showClearButton || showApplyButton) && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div>
                            {showClearButton && (selectedRange.startDate || selectedRange.endDate) && (
                                <button
                                    onClick={onClear}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    <RotateCcw size={14} />
                                    Clear
                                </button>
                            )}
                        </div>

                        <div>
                            {showApplyButton && (
                                <button
                                    onClick={onApply}
                                    className="flex items-center gap-2 px-4 py-2 bg-gold hover:bg-gold/90 text-black text-sm font-medium rounded transition-colors"
                                >
                                    <Check size={14} />
                                    Apply
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}