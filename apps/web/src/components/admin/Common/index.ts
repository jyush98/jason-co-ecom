// Clean exports for all admin common components

// Phase 2A Foundation Components ✅ COMPLETE
export { default as DataTable } from './DataTable';
export { default as NotificationBell } from './NotificationBell';
export { default as MetricCard } from './MetricCard';
export { default as FilterBar } from './FilterBar';
export { default as DateRangePicker } from './DateRangePicker';
export { default as ExportButton } from './ExportButton';
export { default as LoadingSpinner } from './LoadingSpinner';

// Re-export hooks and utilities
export { useNotifications, NotificationPriority, NotificationType } from './NotificationBell';
export type { Notification } from './NotificationBell';

// Re-export types for DataTable
export type {
    DataTableColumn,
    DataTableProps,
    DataTableAction
} from './DataTable';

export type {
    MetricData,
} from './MetricCard';

// Common component prop types
export interface CommonComponentProps {
    className?: string;
    children?: React.ReactNode;
}

export interface LoadingProps extends CommonComponentProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'spinner' | 'dots' | 'bars';
}

export interface MetricCardProps extends CommonComponentProps {
    title: string;
    value: string | number;
    change?: number;
    changeType?: 'increase' | 'decrease' | 'neutral';
    trend?: number[];
    icon?: React.ReactNode;
    description?: string;
    actionButton?: {
        label: string;
        onClick: () => void;
    };
}

export interface FilterBarProps extends CommonComponentProps {
    onFilterChange: (filters: Record<string, any>) => void;
    onClear: () => void;
    showClearButton?: boolean;
}

export interface DateRangePickerProps extends CommonComponentProps {
    startDate?: Date;
    endDate?: Date;
    onDateChange: (startDate: Date, endDate: Date) => void;
    presets?: Array<{
        label: string;
        value: [Date, Date];
    }>;
    maxDate?: Date;
    minDate?: Date;
}

export interface ExportButtonProps extends CommonComponentProps {
    data: any[];
    filename?: string;
    format?: 'csv' | 'excel' | 'pdf';
    disabled?: boolean;
    onExport?: () => void;
}

// Component status constants
export const ComponentStatus = {
    COMPLETE: '✅ Complete - Production Ready',
    IN_PROGRESS: '🔧 In Progress - Building Now',
    PENDING: '📋 Pending - Planned for Phase 2A',
    FUTURE: '🚀 Future - Phase 2B+'
} as const;

// Phase 2A completion tracking
export const Phase2AComponents = {
    AdminLayout: ComponentStatus.COMPLETE,
    DataTable: ComponentStatus.COMPLETE,
    NotificationBell: ComponentStatus.COMPLETE,
    MetricCard: ComponentStatus.IN_PROGRESS,
    FilterBar: ComponentStatus.PENDING,
    DateRangePicker: ComponentStatus.PENDING,
    ExportButton: ComponentStatus.PENDING,
    LoadingSpinner: ComponentStatus.PENDING
} as const;