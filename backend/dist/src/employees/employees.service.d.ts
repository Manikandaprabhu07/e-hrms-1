import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { UsersService } from '../users/users.service';
import { RolesService } from '../access/roles.service';
export declare class EmployeesService {
    private employeesRepository;
    private usersService;
    private rolesService;
    constructor(employeesRepository: Repository<Employee>, usersService: UsersService, rolesService: RolesService);
    findAll(): Promise<Employee[]>;
    findOne(id: string): Promise<Employee>;
    findByEmail(email: string): Promise<Employee | null>;
    findByUserId(userId: string): Promise<Employee | null>;
    create(employeeData: Partial<Employee> & {
        user?: {
            username?: string;
            password?: string;
            roleName?: string;
        };
    }): Promise<Employee>;
    update(id: string, employeeData: Partial<Employee>): Promise<Employee>;
    remove(id: string): Promise<void>;
}
