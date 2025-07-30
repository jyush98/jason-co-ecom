export const formatCurrency = (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: amount >= 1000 ? 0 : 2
    }).format(amount);
};

export const formatGrowthNumber = (value: number): number => {
    return parseFloat(value.toFixed(2));
    
  };

export const formatCompactCurrency = (amount: number): string => {
    if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
};

export const formatPercentage = (value: number, decimals = 1): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

export const formatGrowth = (value: number): string => {
    const formatted = Math.abs(value).toFixed(1);
    return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
};

export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
};