export interface User {
    userId: string;
    name: string;
    email: string;
    password: string;
    role: string;
    status?: string;
    createdAt?: Date;
    googleToken?: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}