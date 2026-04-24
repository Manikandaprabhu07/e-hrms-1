import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { UsersService } from '../users/users.service';
import { RolesService } from '../access/roles.service';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import {
    EmployeeStatus,
    EmploymentType,
    ShiftType,
    WorkLocationType,
} from './entities/employee.entity';

@Injectable()
export class EmployeesService {
    constructor(
        @InjectRepository(Employee)
        private employeesRepository: Repository<Employee>,
        private usersService: UsersService,
        private rolesService: RolesService,
    ) { }

    findAll(): Promise<Employee[]> {
        return this.employeesRepository.find();
    }

    async findOne(id: string): Promise<Employee> {
        const employee = await this.employeesRepository.findOne({ where: { id } });
        if (!employee) {
            throw new NotFoundException(`Employee with ID ${id} not found`);
        }
        return employee;
    }

    findByEmail(email: string): Promise<Employee | null> {
        return this.employeesRepository.findOne({ where: { email } });
    }

    findByUserId(userId: string): Promise<Employee | null> {
        return this.employeesRepository.findOne({ where: { userId } });
    }

    uploadPreview(file?: { buffer?: Buffer }) {
        if (!file?.buffer?.length) {
            throw new BadRequestException('Please upload an Excel file.');
        }

        const workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];

        if (!sheet) {
            throw new BadRequestException('The uploaded workbook does not contain a readable sheet.');
        }

        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
            defval: '',
            raw: false,
        });

        return rows
            .map((row: Record<string, unknown>, index: number) => this.mapImportRow(row, index))
            .filter((row: Partial<Employee> | null): row is Partial<Employee> => row !== null);
    }

    async saveImportedEmployees(rows: any[]) {
        if (!Array.isArray(rows) || rows.length === 0) {
            throw new BadRequestException('No employees were provided for import.');
        }

        let saved = 0;
        let skipped = 0;

        for (let index = 0; index < rows.length; index += 1) {
            const normalized = this.normalizeImportedEmployee(rows[index], index);
            if (!normalized) {
                skipped += 1;
                continue;
            }

            const existingByEmail = await this.employeesRepository.findOne({
                where: { email: normalized.email },
            });

            if (existingByEmail) {
                skipped += 1;
                continue;
            }

            const existingByEmployeeId = await this.employeesRepository.findOne({
                where: { employeeId: normalized.employeeId },
            });

            if (existingByEmployeeId) {
                skipped += 1;
                continue;
            }

            const employee = this.employeesRepository.create(normalized);
            await this.employeesRepository.save(employee);
            saved += 1;
        }

        return {
            message: 'Employees imported successfully.',
            saved,
            skipped,
        };
    }

    async create(employeeData: Partial<Employee> & { user?: { username?: string; password?: string; roleName?: string } }): Promise<Employee> {
        const userInput = (employeeData as any).user || {};
        const username = userInput.username || (employeeData as any).username;
        const password = userInput.password || (employeeData as any).password;
        const roleName = userInput.roleName || (employeeData as any).roleName || (employeeData as any).role || 'EMPLOYEE';

        let createdUserId: string | null = null;

        try {
            if (username) {
                if (!employeeData.email) {
                    throw new BadRequestException('Email is required to create a login account for the employee.');
                }
                if (!password) {
                    throw new BadRequestException('Password is required to create a login account for the employee.');
                }

                const desiredRole = await this.rolesService.findByName(String(roleName).toUpperCase());
                const fallbackRole = await this.rolesService.findByName('EMPLOYEE');
                const role = desiredRole || fallbackRole;
                const hashedPassword = await bcrypt.hash(String(password), 10);

                const user = await this.usersService.create({
                    email: employeeData.email,
                    username: String(username),
                    password: hashedPassword,
                    firstName: employeeData.firstName || 'Employee',
                    lastName: employeeData.lastName || '',
                    isActive: employeeData.isActive ?? true,
                    roles: role ? [role] : [],
                });

                createdUserId = user.id;
                employeeData.userId = user.id;
            }

            // Strip non-Employee properties that can appear in frontend payloads.
            const employeeEntityData: Partial<Employee> = { ...(employeeData as any) };
            delete (employeeEntityData as any).user;
            delete (employeeEntityData as any).username;
            delete (employeeEntityData as any).password;
            delete (employeeEntityData as any).roleName;
            delete (employeeEntityData as any).role;

            const employee = this.employeesRepository.create(employeeEntityData);
            return await this.employeesRepository.save(employee);
        } catch (error) {
            if (createdUserId) {
                await this.usersService.remove(createdUserId);
            }
            throw error;
        }
    }

    async update(id: string, employeeData: Partial<Employee>): Promise<Employee> {
        const existingEmployee = await this.findOne(id);

        const userInput = (employeeData as any).user || {};
        const username = userInput.username ?? (employeeData as any).username;
        const password = userInput.password ?? (employeeData as any).password;
        const roleName = userInput.roleName ?? (employeeData as any).roleName ?? (employeeData as any).role;

        // Strip non-Employee properties that can appear in frontend payloads.
        delete (employeeData as any).user;
        delete (employeeData as any).username;
        delete (employeeData as any).password;
        delete (employeeData as any).roleName;
        delete (employeeData as any).role;

        let createdUserId: string | null = null;

        try {
            if (username !== undefined || password !== undefined || roleName !== undefined) {
                const desiredRoleName = roleName ? String(roleName).toUpperCase() : undefined;
                const desiredRole = desiredRoleName
                    ? await this.rolesService.findByName(desiredRoleName)
                    : null;
                const fallbackRole = await this.rolesService.findByName('EMPLOYEE');
                const role = desiredRole || fallbackRole;

                const emailForUser = (employeeData as any).email ?? existingEmployee.email;
                if (!emailForUser) {
                    throw new BadRequestException('Email is required to create/update a login account for the employee.');
                }

                if (existingEmployee.userId) {
                    const patch: any = {};

                    if (username !== undefined) patch.username = username ? String(username) : null;
                    if ((employeeData as any).email !== undefined) patch.email = String(emailForUser);
                    if ((employeeData as any).firstName !== undefined) patch.firstName = String((employeeData as any).firstName);
                    if ((employeeData as any).lastName !== undefined) patch.lastName = String((employeeData as any).lastName);
                    if ((employeeData as any).isActive !== undefined) patch.isActive = Boolean((employeeData as any).isActive);

                    if (password) {
                        patch.password = await bcrypt.hash(String(password), 10);
                    }

                    // Only change roles when explicitly provided.
                    if (desiredRoleName && role) {
                        patch.roles = [role];
                    }

                    await this.usersService.update(existingEmployee.userId, patch);
                } else {
                    // Create a login account only if username + password are provided.
                    if (!username) {
                        throw new BadRequestException('Username is required to create a login account for the employee.');
                    }
                    if (!password) {
                        throw new BadRequestException('Password is required to create a login account for the employee.');
                    }

                    const hashedPassword = await bcrypt.hash(String(password), 10);
                    const user = await this.usersService.create({
                        email: String(emailForUser),
                        username: String(username),
                        password: hashedPassword,
                        firstName: (employeeData as any).firstName ?? existingEmployee.firstName ?? 'Employee',
                        lastName: (employeeData as any).lastName ?? existingEmployee.lastName ?? '',
                        isActive: (employeeData as any).isActive ?? existingEmployee.isActive ?? true,
                        roles: role ? [role] : [],
                    });

                    createdUserId = user.id;
                    (employeeData as any).userId = user.id;
                }
            }

            Object.assign(existingEmployee, employeeData);
            return await this.employeesRepository.save(existingEmployee);
        } catch (error) {
            if (createdUserId) {
                await this.usersService.remove(createdUserId);
            }
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        await this.employeesRepository.delete(id);
    }

    private mapImportRow(row: Record<string, unknown>, index: number) {
        const firstName = this.stringValue(row['First Name']);
        const officialEmail = this.stringValue(row['Official Email']);

        if (!firstName || !officialEmail) {
            return null;
        }

        return this.normalizeImportedEmployee(
            {
                employeeId: this.stringValue(row['Employee ID']),
                firstName,
                lastName: this.stringValue(row['Last Name']),
                gender: this.stringValue(row['Gender']),
                dateOfBirth: row['DOB'],
                personalEmail: this.stringValue(row['Personal Email']),
                email: officialEmail,
                phone: this.stringValue(row['Mobile']),
                department: this.stringValue(row['Department']),
                designation: this.stringValue(row['Designation']),
                salary: row['Basic Salary'],
                rowNumber: index + 2,
            },
            index,
        );
    }

    private normalizeImportedEmployee(input: any, index: number): Partial<Employee> | null {
        const firstName = this.stringValue(input?.firstName);
        const email = this.stringValue(input?.email || input?.officialEmail);

        if (!firstName || !email) {
            return null;
        }

        return {
            employeeId: this.stringValue(input?.employeeId) || this.generateImportEmployeeId(index),
            firstName,
            lastName: this.stringValue(input?.lastName),
            email,
            phone: this.stringValue(input?.phone || input?.mobile),
            department: this.stringValue(input?.department) || 'General',
            designation: this.stringValue(input?.designation) || 'Employee',
            employmentType: this.normalizeEmploymentType(input?.employmentType),
            employmentStatus: this.normalizeEmployeeStatus(input?.employmentStatus),
            workLocation: this.normalizeWorkLocation(input?.workLocation),
            shift: this.normalizeShift(input?.shift),
            dateOfJoining: this.normalizeDate(input?.dateOfJoining) || this.todayDate(),
            dateOfBirth: this.normalizeDate(input?.dateOfBirth || input?.dob) || undefined,
            salary: this.numberValue(input?.salary || input?.basicSalary),
            isActive: input?.isActive ?? true,
        };
    }

    private stringValue(value: unknown): string {
        return String(value ?? '').trim();
    }

    private numberValue(value: unknown): number {
        if (value === null || value === undefined || value === '') {
            return 0;
        }

        const parsed = Number(String(value).replace(/,/g, ''));
        return Number.isFinite(parsed) ? parsed : 0;
    }

    private normalizeDate(value: unknown): Date | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return value;
        }

        if (typeof value === 'number') {
            const parsedDate = XLSX.SSF.parse_date_code(value);
            if (parsedDate) {
                return new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d);
            }
        }

        const parsed = new Date(String(value));
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }

        return null;
    }

    private normalizeEmploymentType(value: unknown): EmploymentType {
        const normalized = this.stringValue(value).toLowerCase();
        const map: Record<string, EmploymentType> = {
            permanent: EmploymentType.PERMANENT,
            contract: EmploymentType.CONTRACT,
            temporary: EmploymentType.TEMPORARY,
            part_time: EmploymentType.PART_TIME,
            'part time': EmploymentType.PART_TIME,
            intern: EmploymentType.INTERN,
        };
        return map[normalized] || EmploymentType.PERMANENT;
    }

    private normalizeEmployeeStatus(value: unknown): EmployeeStatus {
        const normalized = this.stringValue(value).toLowerCase();
        const map: Record<string, EmployeeStatus> = {
            active: EmployeeStatus.ACTIVE,
            on_leave: EmployeeStatus.ON_LEAVE,
            'on leave': EmployeeStatus.ON_LEAVE,
            resigned: EmployeeStatus.RESIGNED,
            terminated: EmployeeStatus.TERMINATED,
            probation: EmployeeStatus.PROBATION,
        };
        return map[normalized] || EmployeeStatus.ACTIVE;
    }

    private normalizeWorkLocation(value: unknown): WorkLocationType {
        const normalized = this.stringValue(value).toLowerCase();
        const map: Record<string, WorkLocationType> = {
            office: WorkLocationType.OFFICE,
            remote: WorkLocationType.REMOTE,
            hybrid: WorkLocationType.HYBRID,
        };
        return map[normalized] || WorkLocationType.OFFICE;
    }

    private normalizeShift(value: unknown): ShiftType {
        const normalized = this.stringValue(value).toLowerCase();
        const map: Record<string, ShiftType> = {
            morning: ShiftType.MORNING,
            evening: ShiftType.EVENING,
            night: ShiftType.NIGHT,
            flexible: ShiftType.FLEXIBLE,
        };
        return map[normalized] || ShiftType.MORNING;
    }

    private generateImportEmployeeId(index: number): string {
        return `IMP${Date.now()}${String(index + 1).padStart(3, '0')}`;
    }

    private todayDate(): Date {
        return new Date();
    }
}
