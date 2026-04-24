"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = exports.ShiftType = exports.WorkLocationType = exports.EmployeeStatus = exports.EmploymentType = void 0;
const typeorm_1 = require("typeorm");
var EmploymentType;
(function (EmploymentType) {
    EmploymentType["PERMANENT"] = "permanent";
    EmploymentType["CONTRACT"] = "contract";
    EmploymentType["TEMPORARY"] = "temporary";
    EmploymentType["PART_TIME"] = "part_time";
    EmploymentType["INTERN"] = "intern";
})(EmploymentType || (exports.EmploymentType = EmploymentType = {}));
var EmployeeStatus;
(function (EmployeeStatus) {
    EmployeeStatus["ACTIVE"] = "active";
    EmployeeStatus["ON_LEAVE"] = "on_leave";
    EmployeeStatus["RESIGNED"] = "resigned";
    EmployeeStatus["TERMINATED"] = "terminated";
    EmployeeStatus["PROBATION"] = "probation";
})(EmployeeStatus || (exports.EmployeeStatus = EmployeeStatus = {}));
var WorkLocationType;
(function (WorkLocationType) {
    WorkLocationType["OFFICE"] = "office";
    WorkLocationType["REMOTE"] = "remote";
    WorkLocationType["HYBRID"] = "hybrid";
})(WorkLocationType || (exports.WorkLocationType = WorkLocationType = {}));
var ShiftType;
(function (ShiftType) {
    ShiftType["MORNING"] = "morning";
    ShiftType["EVENING"] = "evening";
    ShiftType["NIGHT"] = "night";
    ShiftType["FLEXIBLE"] = "flexible";
})(ShiftType || (exports.ShiftType = ShiftType = {}));
let Employee = class Employee {
};
exports.Employee = Employee;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Employee.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Employee.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Employee.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "designation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EmploymentType,
        default: EmploymentType.PERMANENT
    }),
    __metadata("design:type", String)
], Employee.prototype, "employmentType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EmployeeStatus,
        default: EmployeeStatus.ACTIVE
    }),
    __metadata("design:type", String)
], Employee.prototype, "employmentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: WorkLocationType,
        default: WorkLocationType.OFFICE
    }),
    __metadata("design:type", String)
], Employee.prototype, "workLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ShiftType,
        default: ShiftType.MORNING
    }),
    __metadata("design:type", String)
], Employee.prototype, "shift", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Employee.prototype, "dateOfJoining", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Employee.prototype, "dateOfResignation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Employee.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "salary", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Employee.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Employee.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Employee.prototype, "updatedAt", void 0);
exports.Employee = Employee = __decorate([
    (0, typeorm_1.Entity)('employees')
], Employee);
//# sourceMappingURL=employee.entity.js.map