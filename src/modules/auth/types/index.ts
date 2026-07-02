export interface TokenPayload {
    id: string;
    role: string;
}

export interface AuthResponse {
    success: boolean;
    user?: any;
    message?: string;
    error?: string;
}
