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
exports.TrainingAssignment = void 0;
const typeorm_1 = require("typeorm");
const training_entity_1 = require("./training.entity");
const employee_entity_1 = require("../../employees/entities/employee.entity");
let TrainingAssignment = class TrainingAssignment {
};
exports.TrainingAssignment = TrainingAssignment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TrainingAssignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => training_entity_1.Training, { onDelete: 'CASCADE' }),
    __metadata("design:type", training_entity_1.Training)
], TrainingAssignment.prototype, "training", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, { onDelete: 'CASCADE' }),
    __metadata("design:type", employee_entity_1.Employee)
], TrainingAssignment.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Assigned' }),
    __metadata("design:type", String)
], TrainingAssignment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TrainingAssignment.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], TrainingAssignment.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TrainingAssignment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TrainingAssignment.prototype, "updatedAt", void 0);
exports.TrainingAssignment = TrainingAssignment = __decorate([
    (0, typeorm_1.Entity)('training_assignments'),
    (0, typeorm_1.Index)(['training', 'employee'], { unique: true })
], TrainingAssignment);
//# sourceMappingURL=training-assignment.entity.js.map