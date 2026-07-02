export interface UserLocation {
    country?: string;
    state?: string;
    city?: string;
    pincode?: string;
    address?: string;
}

export interface UserProfile {
    id: string;
    username: string;
    gmail: string;
    rollNumber?: string;
    role: string;
    phone?: string;
    dob?: string;
    location?: UserLocation;
    classIn?: string;
    batch?: string;
    bio?: string;
    avatar?: string;
    results?: string[];
}
