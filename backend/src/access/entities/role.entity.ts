import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ default: '' })
    description: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToMany(() => Permission, { eager: true })
    @JoinTable({
        name: 'role_permissions',
        joinColumn: { name: 'roleId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' }
    })
    permissions: Permission[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
