"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronUp,
    ChevronDown,
    Search,
    Filter,
    Download,
    RefreshCw,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown
} from "lucide-react";

// Types for the DataTable
export interface DataTableColumn<T = any> {
    key: string;
    title: string;
    sortable?: boolean;
    filterable?: boolean;
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
    searchable?: boolean;
    filterable?: boolean;
    exportable?: boolean;
    refreshable?: boolean;
    selectable?: boolean;
    pagination?: {
        enabled: boolean;
        pageSize?: number;
        showSizeSelector?: boolean;
    };
    onSearch?: (query: string) => void;
    onFilter?: (filters: Record<string, any>) => void;
    onExport?: () => void;
    onRefresh?: () => void;
    onSelectionChange?: (selectedRows: T[]) => void;
    className?: string;
    emptyMessage?: string;
    loadingMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
    columns,
    data,
    actions = [],
    isLoading = false,
    error = null,
    searchable = true,
    filterable = true,
    exportable = true,
    refreshable = true,
    selectable = false,
    pagination = { enabled: true, pageSize: 10, showSizeSelector: true },
    onSearch,
    onFilter,
    onExport,
    onRefresh,
    onSelectionChange,
    className = "",
    emptyMessage = "No data available",
    loadingMessage = "Loading data..."
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
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<Record<string, any>>({});

    // Filtered and sorted data
    const processedData = useMemo(() => {
        let filtered = [...data];

        // Apply search
        if (searchQuery && searchable) {
            filtered = filtered.filter(row =>
                Object.values(row).some(value =>
                    String(value).toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== "" && value !== null) {
                filtered = filtered.filter(row => {
                    const rowValue = row[key];
                    if (typeof value === 'string') {
                        return String(rowValue).toLowerCase().includes(value.toLowerCase());
                    }
                    return rowValue === value;
                });
            }
        });

        // Apply sorting
        if (sortConfig) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue === bValue) return 0;

                const comparison = aValue < bValue ? -1 : 1;
                return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
            });
        }

        return filtered;
    }, [data, searchQuery, sortConfig, filters, searchable]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = pagination.enabled
        ? processedData.slice(startIndex, endIndex)
        : processedData;

    // Handle sorting
    const handleSort = (key: string) => {
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
    };

    // Handle search
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
        onSearch?.(query);
    };

    // Handle selection
    const handleSelectRow = (index: number) => {
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
    };

    // Handle select all
    const handleSelectAll = () => {
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
    };

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
            className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Table Header */}
            <motion.div
                variants={itemVariants}
                className="p-6 border-b border-gray-200 dark:border-gray-700"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left side - Search */}
                    <div className="flex items-center gap-4 flex-1">
                        {searchable && (
                            <div className="relative max-w-sm">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                />
                            </div>
                        )}

                        {/* Results count */}
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {processedData.length} {processedData.length === 1 ? 'result' : 'results'}
                            {selectedRows.size > 0 && (
                                <span className="ml-2">({selectedRows.size} selected)</span>
                            )}
                        </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center gap-2">
                        {filterable && (
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 rounded-lg border transition-colors ${showFilters || Object.keys(filters).length > 0
                                        ? 'border-gold bg-gold/10 text-gold'
                                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <Filter size={16} />
                            </button>
                        )}

                        {refreshable && (
                            <button
                                onClick={onRefresh}
                                disabled={isLoading}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                            </button>
                        )}

                        {exportable && (
                            <button
                                onClick={onExport}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <Download size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters Row */}
                <AnimatePresence>
                    {showFilters && filterable && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {columns.filter(col => col.filterable).map(column => (
                                        <div key={column.key}>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                {column.title}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder={`Filter by ${column.title.toLowerCase()}`}
                                                value={filters[column.key] || ''}
                                                onChange={(e) => {
                                                    const newFilters = { ...filters, [column.key]: e.target.value };
                                                    setFilters(newFilters);
                                                    onFilter?.(newFilters);
                                                }}
                                                className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gold focus:border-transparent"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Error State */}
            {error && (
                <motion.div
                    variants={itemVariants}
                    className="p-6 text-center"
                >
                    <div className="text-red-500 text-sm">{error}</div>
                </motion.div>
            )}

            {/* Loading State */}
            {isLoading && (
                <motion.div
                    variants={itemVariants}
                    className="p-12 text-center"
                >
                    <div className="flex items-center justify-center gap-3">
                        <RefreshCw size={20} className="animate-spin text-gold" />
                        <span className="text-gray-600 dark:text-gray-400">{loadingMessage}</span>
                    </div>
                </motion.div>
            )}

            {/* Table */}
            {!isLoading && !error && (
                <motion.div variants={itemVariants} className="overflow-x-auto">
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
                </motion.div>
            )}

            {/* Pagination */}
            {pagination.enabled && !isLoading && !error && totalPages > 1 && (
                <motion.div
                    variants={itemVariants}
                    className="px-6 py-4 border-t border-gray-200 dark:border-gray-700"
                >
                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalItems={processedData.length}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={pagination.showSizeSelector ? setPageSize : undefined}
                    />
                </motion.div>
            )}
        </motion.div>
    );
}

// Table Actions Component
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

// Table Pagination Component
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