import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    findAll(): Promise<Employee[]>;
    me(req: any): Promise<Employee>;
    findOne(id: string): Promise<Employee>;
    create(employeeData: Partial<Employee> & {
        user?: {
            username?: string;
            password?: string;
            roleName?: string;
        };
    }): Promise<Employee>;
    update(id: string, employeeData: Partial<Employee> & {
        user?: {
            username?: string;
            password?: string;
            roleName?: string;
        };
    }): Promise<Employee>;
    remove(id: string): Promise<void>;
}
