"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Download,
    FileText,
    FileSpreadsheet,
    File,
    ChevronDown,
    Check,
    AlertCircle,
    X,
    Filter
} from "lucide-react";

export interface ExportFormat {
    id: string;
    label: string;
    extension: string;
    mimeType: string;
    icon: React.ReactNode;
    description?: string;
    maxRows?: number;
    supportsFiltering?: boolean;
    supportsFormatting?: boolean;
}

export interface ExportOptions {
    format: string;
    includeHeaders?: boolean;
    includeFilters?: boolean;
    dateRange?: {
        start: Date;
        end: Date;
    };
    selectedColumns?: string[];
    maxRows?: number;
    filename?: string;
}

export interface ExportProgress {
    status: 'idle' | 'preparing' | 'exporting' | 'completed' | 'error';
    progress: number;
    message: string;
    downloadUrl?: string;
    error?: string;
}

export interface ExportButtonProps {
    // Data and export handling
    onExport: (options: ExportOptions) => Promise<void> | void;
    data?: any[];
    totalRows?: number;

    // Format configuration
    availableFormats?: ExportFormat[];
    defaultFormat?: string;

    // UI customization
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    label?: string;
    className?: string;
    disabled?: boolean;

    // Advanced options
    showFormatSelector?: boolean;
    showAdvancedOptions?: boolean;
    allowColumnSelection?: boolean;
    allowRowLimit?: boolean;
    allowFiltering?: boolean;

    // Data context
    filterLabel?: string;
    activeFilters?: Record<string, any>;
    columnOptions?: { label: string; value: string; required?: boolean }[];

    // Progress handling
    showProgress?: boolean;
    onProgressUpdate?: (progress: ExportProgress) => void;
}

// Default export formats
const defaultFormats: ExportFormat[] = [
    {
        id: 'csv',
        label: 'CSV',
        extension: 'csv',
        mimeType: 'text/csv',
        icon: <FileSpreadsheet size={16} />,
        description: 'Comma-separated values, compatible with Excel',
        supportsFiltering: true,
        supportsFormatting: false
    },
    {
        id: 'excel',
        label: 'Excel',
        extension: 'xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        icon: <FileSpreadsheet size={16} />,
        description: 'Microsoft Excel format with formatting',
        supportsFiltering: true,
        supportsFormatting: true
    },
    {
        id: 'pdf',
        label: 'PDF',
        extension: 'pdf',
        mimeType: 'application/pdf',
        icon: <FileText size={16} />,
        description: 'Formatted PDF document',
        maxRows: 1000,
        supportsFiltering: true,
        supportsFormatting: true
    },
    {
        id: 'json',
        label: 'JSON',
        extension: 'json',
        mimeType: 'application/json',
        icon: <File size={16} />,
        description: 'JavaScript Object Notation, for developers',
        supportsFiltering: true,
        supportsFormatting: false
    }
];

export default function ExportButton({
    onExport,
    data = [],
    totalRows,
    availableFormats = defaultFormats,
    defaultFormat = 'csv',
    size = 'md',
    variant = 'primary',
    label = 'Export',
    className = "",
    disabled = false,
    showFormatSelector = true,
    showAdvancedOptions = true,
    allowColumnSelection = true,
    allowRowLimit = true,
    allowFiltering = true,
    filterLabel = "Current filters",
    activeFilters = {},
    columnOptions = [],
    showProgress = true,
    onProgressUpdate
}: ExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState(defaultFormat);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [exportOptions, setExportOptions] = useState<ExportOptions>({
        format: defaultFormat,
        includeHeaders: true,
        includeFilters: false,
        selectedColumns: [],
        maxRows: undefined,
        filename: ''
    });
    const [progress, setProgress] = useState<ExportProgress>({
        status: 'idle',
        progress: 0,
        message: ''
    });

    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentFormat = availableFormats.find(f => f.id === selectedFormat);
    const hasActiveFilters = Object.keys(activeFilters).length > 0;
    const displayTotalRows = totalRows || data.length;

    const sizeClasses = {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg'
    };

    const variantClasses = {
        primary: 'bg-gold hover:bg-gold/90 text-black border-gold',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600',
        outline: 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
        ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-transparent'
    };

    const handleQuickExport = async () => {
        if (!showFormatSelector) {
            await performExport();
        } else {
            setIsOpen(!isOpen);
        }
    };

    const handleFormatSelect = (formatId: string) => {
        setSelectedFormat(formatId);
        setExportOptions(prev => ({ ...prev, format: formatId }));
    };

    const handleOptionChange = (key: keyof ExportOptions, value: any) => {
        setExportOptions(prev => ({ ...prev, [key]: value }));
    };

    const performExport = async () => {
        const finalOptions: ExportOptions = {
            ...exportOptions,
            format: selectedFormat,
            filename: exportOptions.filename || generateFilename()
        };

        setProgress({ status: 'preparing', progress: 0, message: 'Preparing export...' });

        try {
            // Simulate progress updates
            if (showProgress) {
                const progressSteps = [
                    { progress: 25, message: 'Processing data...' },
                    { progress: 50, message: 'Applying filters...' },
                    { progress: 75, message: 'Generating file...' },
                    { progress: 100, message: 'Download ready!' }
                ];

                for (const step of progressSteps) {
                    setProgress(prev => ({ ...prev, ...step, status: 'exporting' }));
                    onProgressUpdate?.({ ...progress, ...step, status: 'exporting' });
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }

            await onExport(finalOptions);

            setProgress({
                status: 'completed',
                progress: 100,
                message: 'Export completed successfully!'
            });

            // Auto-close after success
            setTimeout(() => {
                setIsOpen(false);
                setProgress({ status: 'idle', progress: 0, message: '' });
            }, 2000);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Export failed';
            setProgress({
                status: 'error',
                progress: 0,
                message: errorMessage,
                error: errorMessage
            });

            // Reset after error display
            setTimeout(() => {
                setProgress({ status: 'idle', progress: 0, message: '' });
            }, 3000);
        }
    };

    const generateFilename = (): string => {
        const date = new Date().toISOString().split('T')[0];
        const formatExt = currentFormat?.extension || 'csv';
        return `export-${date}.${formatExt}`;
    };

    const dropdownVariants = {
        hidden: { opacity: 0, scale: 0.95, y: -10 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.2, ease: "easeOut" }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: -10,
            transition: { duration: 0.15 }
        }
    };

    const isExporting = progress.status === 'preparing' || progress.status === 'exporting';
    const hasError = progress.status === 'error';
    const isCompleted = progress.status === 'completed';

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Main Button */}
            <button
                onClick={handleQuickExport}
                disabled={disabled || isExporting}
                className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          inline-flex items-center gap-2
          border font-medium rounded-lg
          transition-all duration-200
          hover:scale-[1.02]
          focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          ${isExporting ? 'cursor-wait' : ''}
          ${hasError ? 'border-red-500 bg-red-50 text-red-700' : ''}
          ${isCompleted ? 'border-green-500 bg-green-50 text-green-700' : ''}
        `}
            >
                {isExporting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : hasError ? (
                    <AlertCircle size={16} />
                ) : isCompleted ? (
                    <Check size={16} />
                ) : (
                    <Download size={16} />
                )}

                <span>
                    {isExporting ? 'Exporting...' :
                        hasError ? 'Error' :
                            isCompleted ? 'Completed' :
                                label}
                </span>

                {showFormatSelector && !isExporting && !hasError && !isCompleted && (
                    <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            {/* Export Options Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute top-full right-0 z-50 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl"
                    >
                        <div className="p-4 space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Export Options
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Export Info */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Total rows:</span>
                                    <span className="font-medium">{displayTotalRows.toLocaleString()}</span>
                                </div>
                                {hasActiveFilters && (
                                    <div className="flex items-center justify-between text-sm mt-1">
                                        <span className="text-gray-600 dark:text-gray-400">Active filters:</span>
                                        <span className="font-medium text-gold">{Object.keys(activeFilters).length}</span>
                                    </div>
                                )}
                            </div>

                            {/* Format Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Export Format
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {availableFormats.map((format) => (
                                        <button
                                            key={format.id}
                                            onClick={() => handleFormatSelect(format.id)}
                                            className={`
                        flex items-center gap-2 p-3 border rounded-lg text-left transition-all
                        ${selectedFormat === format.id
                                                    ? 'border-gold bg-gold/10 text-gold'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gold/50'
                                                }
                      `}
                                        >
                                            {format.icon}
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium">{format.label}</div>
                                                {format.description && (
                                                    <div className="text-xs text-gray-500 truncate">
                                                        {format.description}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Basic Options */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={exportOptions.includeHeaders}
                                        onChange={(e) => handleOptionChange('includeHeaders', e.target.checked)}
                                        className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
                                    />
                                    <span className="text-sm">Include column headers</span>
                                </label>

                                {hasActiveFilters && allowFiltering && (
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={exportOptions.includeFilters}
                                            onChange={(e) => handleOptionChange('includeFilters', e.target.checked)}
                                            className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
                                        />
                                        <span className="text-sm flex items-center gap-1">
                                            <Filter size={14} />
                                            Apply current filters
                                        </span>
                                    </label>
                                )}
                            </div>

                            {/* Advanced Options Toggle */}
                            {showAdvancedOptions && (
                                <button
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="flex items-center gap-2 text-sm text-gold hover:text-gold/80 transition-colors"
                                >
                                    <ChevronDown size={14} className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                                    Advanced Options
                                </button>
                            )}

                            {/* Advanced Options */}
                            <AnimatePresence>
                                {showAdvanced && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3"
                                    >
                                        {/* Row Limit */}
                                        {allowRowLimit && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Row Limit
                                                </label>
                                                <input
                                                    type="number"
                                                    value={exportOptions.maxRows || ''}
                                                    onChange={(e) => handleOptionChange('maxRows', e.target.value ? parseInt(e.target.value) : undefined)}
                                                    placeholder="All rows"
                                                    min="1"
                                                    max={currentFormat?.maxRows}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                                                />
                                                {currentFormat?.maxRows && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Maximum {currentFormat.maxRows.toLocaleString()} rows for {currentFormat.label}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Custom Filename */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Filename
                                            </label>
                                            <input
                                                type="text"
                                                value={exportOptions.filename || ''}
                                                onChange={(e) => handleOptionChange('filename', e.target.value)}
                                                placeholder={generateFilename()}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                                            />
                                        </div>

                                        {/* Column Selection */}
                                        {allowColumnSelection && columnOptions.length > 0 && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Columns to Include
                                                </label>
                                                <div className="max-h-32 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-700 rounded p-2">
                                                    {columnOptions.map((column) => (
                                                        <label key={column.value} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    exportOptions.selectedColumns?.includes(column.value) ||
                                                                    exportOptions.selectedColumns?.length === 0
                                                                }
                                                                onChange={(e) => {
                                                                    const current = exportOptions.selectedColumns || [];
                                                                    if (e.target.checked) {
                                                                        handleOptionChange('selectedColumns', [...current, column.value]);
                                                                    } else {
                                                                        handleOptionChange('selectedColumns', current.filter(c => c !== column.value));
                                                                    }
                                                                }}
                                                                disabled={column.required}
                                                                className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
                                                            />
                                                            <span className="text-sm">
                                                                {column.label}
                                                                {column.required && <span className="text-red-500 ml-1">*</span>}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Progress Bar */}
                            {showProgress && progress.status !== 'idle' && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">{progress.message}</span>
                                        <span className="text-gray-600 dark:text-gray-400">{progress.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <motion.div
                                            className={`h-2 rounded-full ${progress.status === 'error' ? 'bg-red-500' :
                                                    progress.status === 'completed' ? 'bg-green-500' :
                                                        'bg-gold'
                                                }`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress.progress}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={performExport}
                                    disabled={isExporting}
                                    className="flex-1 px-4 py-2 bg-gold hover:bg-gold/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isExporting ? 'Exporting...' : `Export ${currentFormat?.label}`}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}