/**
 * Jason & Co. Business Information Configuration
 * Centralized source of truth for all business contact information
 * 
 * ⚠️ IMPORTANT: This file contains the authoritative business information.
 * All components should import from this file rather than hardcoding contact details.
 */

export interface BusinessLocation {
    name: string;
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    phone?: string;
    email?: string;
    hours: {
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        sunday: string;
    };
    coordinates?: {
        lat: number;
        lng: number;
    };
}

export interface SocialMediaLinks {
    instagram: string;
    facebook: string;
    twitter: string;
    tiktok: string;
    youtube: string;
    pinterest: string;
    linkedin: string;
}

export interface BusinessContact {
    primary: {
        phone: string;
        email: string;
        whatsapp: string;
    };
    departments: {
        sales: string;
        support: string;
        custom: string;
        returns: string;
        wholesale: string;
        press: string;
        legal: string;
        privacy: string;
    };
}

export interface BusinessInfo {
    company: {
        name: string;
        tagline: string;
        description: string;
        founded: string;
        website: string;
    };
    contact: BusinessContact;
    locations: {
        headquarters: BusinessLocation;
        showrooms: BusinessLocation[];
    };
    social: SocialMediaLinks;
    legal: {
        businessName: string;
        registrationNumber: string;
        taxId: string;
    };
}

/**
 * JASON & CO. OFFICIAL BUSINESS INFORMATION
 * ==========================================
 * Last Updated: [Current Date]
 * Contact: info@jasonjewels.com for updates
 */
export const businessInfo: BusinessInfo = {
    company: {
        name: "Jason & Co.",
        tagline: "Where Ambition Meets Artistry",
        description: "Luxury jewelry crafted for those who dare to dream without limits. Each piece tells a story of ambition, artistry, and uncompromising quality.",
        founded: "2023",
        website: "https://jasonjewels.com"
    },

    contact: {
        primary: {
            phone: "+1 (929) 623-6634",
            email: "info@jasonjewels.com",
            whatsapp: "+1 (929) 623-6634"
        },
        departments: {
            sales: "sales@jasonjewels.com",
            support: "support@jasonjewels.com",
            custom: "custom@jasonjewels.com",
            returns: "returns@jasonjewels.com",
            wholesale: "wholesale@jasonjewels.com",
            press: "press@jasonjewels.com",
            legal: "legal@jasonjewels.com",
            privacy: "privacy@jasonjewels.com",
        }
    },

    locations: {
        headquarters: {
            name: "Jason & Co. Headquarters",
            address: {
                street: "62 W 47th St",
                city: "New York",
                state: "NY",
                zip: "10036",
                country: "United States"
            },
            phone: "+1 (929) 623-6634",
            email: "info@jasonjewels.com",
            hours: {
                monday: "9:00 AM - 6:00 PM",
                tuesday: "9:00 AM - 6:00 PM",
                wednesday: "9:00 AM - 6:00 PM",
                thursday: "9:00 AM - 6:00 PM",
                friday: "9:00 AM - 6:00 PM",
                saturday: "10:00 AM - 4:00 PM",
                sunday: "Closed"
            },
            coordinates: {
                lat: 34.0736,
                lng: -118.4004
            }
        },
        showrooms: [
            {
                name: "Jason & Co. Headquarters",
                address: {
                    street: "62 W 47th St",
                    city: "New York",
                    state: "NY",
                    zip: "10036",
                    country: "United States"
                },
                phone: "+1 (929) 623-6634",
                hours: {
                    monday: "10:00 AM - 7:00 PM",
                    tuesday: "10:00 AM - 7:00 PM",
                    wednesday: "10:00 AM - 7:00 PM",
                    thursday: "10:00 AM - 7:00 PM",
                    friday: "10:00 AM - 8:00 PM",
                    saturday: "10:00 AM - 8:00 PM",
                    sunday: "12:00 PM - 6:00 PM"
                },
                coordinates: {
                    lat: 34.0696,
                    lng: -118.4006
                }
            },
        ]
    },

    social: {
        instagram: "https://instagram.com/jasonjeweler",
        facebook: "https://facebook.com/", // Placeholder - replace with real URL
        twitter: "https://twitter.com/jasonandco_", // Placeholder - replace with real URL
        tiktok: "https://tiktok.com/@jasonjeweler",
        youtube: "https://youtube.com/@jasonandcoofficial", // Placeholder - replace with real URL
        pinterest: "https://pinterest.com/jasonandcoofficial", // Placeholder - replace with real URL
        linkedin: "https://linkedin.com/company/jasonandco" // Placeholder - replace with real URL
    },

    legal: {
        businessName: "Jason Jewelry Wholesale Co.",
        registrationNumber: "LLC-2020-JASON-001", // Placeholder - replace with real registration number
        taxId: "XX-XXXXXXX" // Placeholder - replace with real tax ID
    }
};

/**
 * UTILITY FUNCTIONS
 * =================
 */

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
        const number = cleaned.slice(1);
        return `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phone;
};

// Format address for display
export const formatAddress = (address: BusinessLocation['address']): string => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`;
};

// Get business hours for a specific day
export const getBusinessHours = (day: keyof BusinessLocation['hours'], location: BusinessLocation = businessInfo.locations.headquarters): string => {
    return location.hours[day];
};

// Check if business is currently open
export const isBusinessOpen = (location: BusinessLocation = businessInfo.locations.headquarters): boolean => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentHour = now.getHours();

    const days: (keyof BusinessLocation['hours'])[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayHours = location.hours[days[dayOfWeek]];

    if (todayHours === 'Closed') return false;

    // Parse hours (assumes format like "9:00 AM - 6:00 PM")
    const [open, close] = todayHours.split(' - ');
    const openHour = parseInt(open.split(':')[0]) + (open.includes('PM') && !open.includes('12') ? 12 : 0);
    const closeHour = parseInt(close.split(':')[0]) + (close.includes('PM') && !close.includes('12') ? 12 : 0);

    return currentHour >= openHour && currentHour < closeHour;
};

// Generate Google Maps link
export const getGoogleMapsLink = (location: BusinessLocation): string => {
    const address = formatAddress(location.address);
    return `https://maps.google.com/maps?q=${encodeURIComponent(address)}`;
};

// Generate directions link
export const getDirectionsLink = (location: BusinessLocation): string => {
    if (location.coordinates) {
        return `https://maps.google.com/maps?daddr=${location.coordinates.lat},${location.coordinates.lng}`;
    }
    return getGoogleMapsLink(location);
};

/**
 * EXPORT SHORTCUTS
 * ================
 */

// Quick access to commonly used information
export const COMPANY_NAME = businessInfo.company.name;
export const COMPANY_TAGLINE = businessInfo.company.tagline;
export const PRIMARY_EMAIL = businessInfo.contact.primary.email;
export const PRIMARY_PHONE = businessInfo.contact.primary.phone;
export const HEADQUARTERS_ADDRESS = businessInfo.locations.headquarters.address;
export const SOCIAL_LINKS = businessInfo.social;

// Email constants for easy import
export const EMAIL_ADDRESSES = {
    INFO: businessInfo.contact.primary.email,
    SALES: businessInfo.contact.departments.sales,
    SUPPORT: businessInfo.contact.departments.support,
    CUSTOM: businessInfo.contact.departments.custom,
    RETURNS: businessInfo.contact.departments.returns,
    WHOLESALE: businessInfo.contact.departments.wholesale,
    PRESS: businessInfo.contact.departments.press,
    LEGAL: businessInfo.contact.departments.legal,
    PRIVACY: businessInfo.contact.departments.privacy,
} as const;

export const ADMIN_EMAIL_ADDRESSES = [
    "jonathan@jasonsjewel.com",
    "jason@jasonsjewel.com",
    "jyushuvayev98@gmail.com",
];

export default businessInfo;