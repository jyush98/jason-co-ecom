"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronUp,
    ChevronDown,
    Download,
    RefreshCw,
    MoreHorizontal,
    Eye,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
    Calendar,
    DollarSign,
    Package,
    Users
} from "lucide-react";
import FilterBar, { FilterConfig, FilterValue } from "./FilterBar";

// Enhanced DataTable types with FilterBar integration
export interface DataTableColumn<T = any> {
    key: string;
    title: string;
    sortable?: boolean;
    filterable?: boolean;
    filterType?: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'text' | 'boolean';
    filterOptions?: Array<{ label: string; value: string | number; count?: number }>;
    render?: (value: any, row: T, index: number) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

export interface DataTableAction<T = any> {
    label: string;
    icon?: React.ElementType;
    onClick: (row: T, index: number) => void;
    variant?: 'default' | 'primary' | 'danger';
    disabled?: (row: T) => boolean;
    hidden?: (row: T) => boolean;
}

export interface DataTableProps<T = any> {
    columns: DataTableColumn<T>[];
    data: T[];
    actions?: DataTableAction<T>[];
    isLoading?: boolean;
    error?: string | null;

    // Enhanced filtering options
    enableAdvancedFiltering?: boolean;
    quickFilters?: Array<{
        label: string;
        filters: FilterValue;
        icon?: React.ReactNode;
    }>;

    // Search configuration
    searchable?: boolean;
    searchKeys?: string[]; // Specific keys to search within
    searchPlaceholder?: string;

    // Export and refresh
    exportable?: boolean;
    refreshable?: boolean;
    onExport?: (filteredData: T[]) => void;
    onRefresh?: () => void;

    // Selection
    selectable?: boolean;
    onSelectionChange?: (selectedRows: T[]) => void;

    // Pagination
    pagination?: {
        enabled: boolean;
        pageSize?: number;
        showSizeSelector?: boolean;
    };

    // Callbacks
    onSearch?: (query: string, searchKeys: string[]) => void;
    onFiltersChange?: (filters: FilterValue) => void;

    // Customization
    className?: string;
    emptyMessage?: string;
    loadingMessage?: string;
    persistFilters?: boolean;
    storageKey?: string;
}

export default function EnhancedDataTable<T extends Record<string, any>>({
    columns,
    data,
    actions = [],
    isLoading = false,
    error = null,

    // Advanced filtering
    enableAdvancedFiltering = true,
    quickFilters = [],

    // Search
    searchable = true,
    searchKeys = [],
    searchPlaceholder = "Search all columns...",

    // Actions
    exportable = true,
    refreshable = true,
    onExport,
    onRefresh,

    // Selection
    selectable = false,
    onSelectionChange,

    // Pagination
    pagination = { enabled: true, pageSize: 10, showSizeSelector: true },

    // Callbacks
    onSearch,
    onFiltersChange,

    // Customization
    className = "",
    emptyMessage = "No data available",
    loadingMessage = "Loading data...",
    persistFilters = true,
    storageKey = "datatable-filters"
}: DataTableProps<T>) {

    // State management
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: 'asc' | 'desc';
    } | null>(null);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(pagination.pageSize || 10);
    const [filters, setFilters] = useState<FilterValue>({});

    // Generate filter configurations from columns
    const filterConfigs: FilterConfig[] = useMemo(() => {
        return columns
            .filter(col => col.filterable)
            .map(col => ({
                key: col.key,
                label: col.title,
                type: col.filterType || 'text',
                options: col.filterOptions,
                placeholder: `Filter by ${col.title.toLowerCase()}`,
                icon: getFilterIcon(col.key, col.filterType)
            }));
    }, [columns]);

    // Helper function to get appropriate icons for filters
    function getFilterIcon(key: string, type?: string) {
        if (type === 'date' || type === 'daterange') return <Calendar size={16} />;
        if (type === 'number' || key.includes('price') || key.includes('amount')) return <DollarSign size={16} />;
        if (key.includes('customer') || key.includes('user')) return <Users size={16} />;
        if (key.includes('product') || key.includes('item')) return <Package size={16} />;
        return undefined;
    }

    // Enhanced data processing with advanced filtering
    const processedData = useMemo(() => {
        let filtered = [...data];

        // Apply advanced filters from FilterBar
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== "" && value !== null) {
                filtered = filtered.filter(row => {
                    const rowValue = row[key];
                    const column = columns.find(col => col.key === key);

                    // Handle different filter types
                    switch (column?.filterType) {
                        case 'multiselect':
                            return Array.isArray(value) && value.includes(rowValue);

                        case 'daterange':
                            if (value.start && value.end) {
                                const rowDate = new Date(rowValue);
                                const startDate = new Date(value.start);
                                const endDate = new Date(value.end);
                                return rowDate >= startDate && rowDate <= endDate;
                            }
                            return true;

                        case 'date':
                            return new Date(rowValue).toDateString() === new Date(value).toDateString();

                        case 'number':
                            return Number(rowValue) === Number(value);

                        case 'boolean':
                            return Boolean(rowValue) === Boolean(value);

                        case 'select':
                            return rowValue === value;

                        default: // text
                            return String(rowValue).toLowerCase().includes(String(value).toLowerCase());
                    }
                });
            }
        });

        // Apply search query
        if (searchQuery && searchable) {
            const keysToSearch = searchKeys.length > 0 ? searchKeys : Object.keys(data[0] || {});
            filtered = filtered.filter(row =>
                keysToSearch.some(key =>
                    String(row[key] || '').toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }

        // Apply sorting
        if (sortConfig) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue === bValue) return 0;

                let comparison = 0;
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    comparison = aValue - bValue;
                } else if (aValue instanceof Date && bValue instanceof Date) {
                    comparison = aValue.getTime() - bValue.getTime();
                } else {
                    comparison = String(aValue).localeCompare(String(bValue));
                }

                return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
            });
        }

        return filtered;
    }, [data, searchQuery, sortConfig, filters, searchable, searchKeys, columns]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = pagination.enabled
        ? processedData.slice(startIndex, endIndex)
        : processedData;

    // Handle filter changes from FilterBar
    const handleFiltersChange = useCallback((newFilters: FilterValue, searchTerm: string) => {
        setFilters(newFilters);
        setSearchQuery(searchTerm);
        setCurrentPage(1); // Reset to first page when filters change

        // Call parent callbacks
        onFiltersChange?.(newFilters);
        if (searchTerm !== searchQuery) {
            onSearch?.(searchTerm, searchKeys);
        }
    }, [onFiltersChange, onSearch, searchKeys, searchQuery]);

    // Handle export with filtered data
    const handleExport = useCallback(() => {
        onExport?.(processedData);
    }, [onExport, processedData]);

    // Handle sorting
    const handleSort = useCallback((key: string) => {
        const column = columns.find(col => col.key === key);
        if (!column?.sortable) return;

        setSortConfig(current => {
            if (current?.key === key) {
                return current.direction === 'asc'
                    ? { key, direction: 'desc' }
                    : null;
            }
            return { key, direction: 'asc' };
        });
    }, [columns]);

    // Handle selection
    const handleSelectRow = useCallback((index: number) => {
        if (!selectable) return;

        const newSelected = new Set(selectedRows);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedRows(newSelected);

        const selectedData = Array.from(newSelected).map(i => paginatedData[i]);
        onSelectionChange?.(selectedData);
    }, [selectable, selectedRows, paginatedData, onSelectionChange]);

    // Handle select all
    const handleSelectAll = useCallback(() => {
        if (!selectable) return;

        const allSelected = selectedRows.size === paginatedData.length;
        if (allSelected) {
            setSelectedRows(new Set());
            onSelectionChange?.([]);
        } else {
            const allIndices = new Set(paginatedData.map((_, index) => index));
            setSelectedRows(allIndices);
            onSelectionChange?.(paginatedData);
        }
    }, [selectable, selectedRows.size, paginatedData, onSelectionChange]);

    // Reset page when data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [data.length]);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className={`space-y-6 ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Advanced FilterBar */}
            {enableAdvancedFiltering && filterConfigs.length > 0 && (
                <motion.div variants={itemVariants}>
                    <FilterBar
                        configs={filterConfigs}
                        searchPlaceholder={searchPlaceholder}
                        searchKeys={searchKeys}
                        onFiltersChange={handleFiltersChange}
                        onExport={exportable ? handleExport : undefined}
                        quickFilters={quickFilters}
                        persistFilters={persistFilters}
                        storageKey={storageKey}
                        showExport={exportable}
                        showClearAll={true}
                        compactMode={false}
                        maxVisibleFilters={6}
                    />
                </motion.div>
            )}

            {/* Data Table */}
            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
                {/* Table Header with Quick Actions */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Results Summary */}
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {processedData.length} {processedData.length === 1 ? 'result' : 'results'}
                                {data.length !== processedData.length && (
                                    <span className="text-gold"> (filtered from {data.length})</span>
                                )}
                                {selectedRows.size > 0 && (
                                    <span className="ml-2 text-gold">({selectedRows.size} selected)</span>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2">
                            {refreshable && (
                                <button
                                    onClick={onRefresh}
                                    disabled={isLoading}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
                                    title="Refresh data"
                                >
                                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                                </button>
                            )}

                            {exportable && (
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-3 py-2 bg-gold hover:bg-gold/90 text-black font-medium rounded-lg transition-all duration-200"
                                    title="Export filtered data"
                                >
                                    <Download size={16} />
                                    <span className="text-sm">Export ({processedData.length})</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="p-6 text-center">
                        <div className="text-red-500 text-sm">{error}</div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="p-12 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <RefreshCw size={20} className="animate-spin text-gold" />
                            <span className="text-gray-600 dark:text-gray-400">{loadingMessage}</span>
                        </div>
                    </div>
                )}

                {/* Table */}
                {!isLoading && !error && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            {/* Table Head */}
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {selectable && (
                                        <th className="w-12 px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 text-gold bg-gray-100 border-gray-300 rounded focus:ring-gold focus:ring-2"
                                            />
                                        </th>
                                    )}

                                    {columns.map((column) => (
                                        <th
                                            key={column.key}
                                            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-300' : ''
                                                } ${column.className || ''}`}
                                            style={{ width: column.width }}
                                            onClick={() => column.sortable && handleSort(column.key)}
                                        >
                                            <div className={`flex items-center gap-2 ${column.align === 'center' ? 'justify-center' :
                                                    column.align === 'right' ? 'justify-end' : ''
                                                }`}>
                                                <span>{column.title}</span>
                                                {column.sortable && (
                                                    <div className="flex flex-col">
                                                        {sortConfig?.key === column.key ? (
                                                            sortConfig.direction === 'asc' ? (
                                                                <ChevronUp size={14} className="text-gold" />
                                                            ) : (
                                                                <ChevronDown size={14} className="text-gold" />
                                                            )
                                                        ) : (
                                                            <ArrowUpDown size={14} className="opacity-50" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                    ))}

                                    {actions.length > 0 && (
                                        <th className="w-20 px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            {emptyMessage}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((row, index) => (
                                        <motion.tr
                                            key={index}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedRows.has(index) ? 'bg-gold/5 border-gold/20' : ''
                                                }`}
                                        >
                                            {selectable && (
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.has(index)}
                                                        onChange={() => handleSelectRow(index)}
                                                        className="w-4 h-4 text-gold bg-gray-100 border-gray-300 rounded focus:ring-gold focus:ring-2"
                                                    />
                                                </td>
                                            )}

                                            {columns.map((column) => (
                                                <td
                                                    key={column.key}
                                                    className={`px-6 py-4 whitespace-nowrap text-sm ${column.align === 'center' ? 'text-center' :
                                                            column.align === 'right' ? 'text-right' : ''
                                                        } ${column.className || ''}`}
                                                >
                                                    {column.render
                                                        ? column.render(row[column.key], row, index)
                                                        : <span className="text-gray-900 dark:text-white">{row[column.key]}</span>
                                                    }
                                                </td>
                                            ))}

                                            {actions.length > 0 && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <TableActions
                                                        actions={actions}
                                                        row={row}
                                                        index={index}
                                                    />
                                                </td>
                                            )}
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.enabled && !isLoading && !error && totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalItems={processedData.length}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={pagination.showSizeSelector ? setPageSize : undefined}
                        />
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

// Table Actions Component (unchanged from original)
interface TableActionsProps<T> {
    actions: DataTableAction<T>[];
    row: T;
    index: number;
}

function TableActions<T>({ actions, row, index }: TableActionsProps<T>) {
    const [showDropdown, setShowDropdown] = useState(false);

    const visibleActions = actions.filter(action => !action.hidden?.(row));

    if (visibleActions.length === 0) return null;

    if (visibleActions.length === 1) {
        const action = visibleActions[0];
        const Icon = action.icon || Eye;

        return (
            <button
                onClick={() => action.onClick(row, index)}
                disabled={action.disabled?.(row)}
                className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.variant === 'danger'
                        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : action.variant === 'primary'
                            ? 'text-gold hover:bg-gold/10'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                title={action.label}
            >
                <Icon size={16} />
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <MoreHorizontal size={16} />
            </button>

            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                        onMouseLeave={() => setShowDropdown(false)}
                    >
                        {visibleActions.map((action, actionIndex) => {
                            const Icon = action.icon || Eye;

                            return (
                                <button
                                    key={actionIndex}
                                    onClick={() => {
                                        action.onClick(row, index);
                                        setShowDropdown(false);
                                    }}
                                    disabled={action.disabled?.(row)}
                                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t-lg last:rounded-b-lg ${action.variant === 'danger'
                                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                            : action.variant === 'primary'
                                                ? 'text-gold hover:bg-gold/10'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <Icon size={16} />
                                    <span>{action.label}</span>
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Table Pagination Component (unchanged from original)
interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
}

function TablePagination({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange
}: TablePaginationProps) {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Results info */}
            <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {startItem} to {endItem} of {totalItems} results
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
                {/* Page size selector */}
                {onPageSizeChange && (
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gold"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                )}

                {/* First page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronsLeft size={16} />
                </button>

                {/* Previous page */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={16} />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {getVisiblePages().map((page, index) => (
                        <div key={index}>
                            {page === '...' ? (
                                <span className="px-3 py-1 text-gray-500 dark:text-gray-400">...</span>
                            ) : (
                                <button
                                    onClick={() => onPageChange(page as number)}
                                    className={`px-3 py-1 text-sm rounded transition-colors ${currentPage === page
                                            ? 'bg-gold text-black font-medium'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {page}
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Next page */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={16} />
                </button>

                {/* Last page */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
}