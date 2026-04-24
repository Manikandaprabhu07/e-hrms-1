import { Permission } from './permission.entity';
export declare class Role {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    permissions: Permission[];
    createdAt: Date;
    updatedAt: Date;
}
