declare global {
    interface Window {
        gtag?: {
            // Web Vitals signature (3 parameters)
            (command: string, action: string, parameters?: Record<string, any>): void;
            // GA4 signature (variable parameters) 
            (...args: any[]): void;
        };
        dataLayer: any[];
        va?: (
            command: 'event',
            parameters: {
                name: string;
                data?: Record<string, any>;
            }
        ) => void;
    }
}

export { };