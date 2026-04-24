import { Role } from '../../access/entities/role.entity';
export declare class User {
    id: string;
    username: string;
    email: string;
    password: string;
    profileImage: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    roles: Role[];
    createdAt: Date;
    updatedAt: Date;
}
