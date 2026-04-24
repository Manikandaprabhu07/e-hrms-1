"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const employees_module_1 = require("./employees/employees.module");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const attendance_module_1 = require("./attendance/attendance.module");
const payroll_module_1 = require("./payroll/payroll.module");
const leave_module_1 = require("./leave/leave.module");
const training_module_1 = require("./training/training.module");
const performance_module_1 = require("./performance/performance.module");
const access_module_1 = require("./access/access.module");
const feedback_module_1 = require("./feedback/feedback.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const events_module_1 = require("./events/events.module");
const notifications_module_1 = require("./notifications/notifications.module");
const messages_module_1 = require("./messages/messages.module");
const chatbar_module_1 = require("./chatbar/chatbar.module");
const core_1 = require("@nestjs/core");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const roles_guard_1 = require("./auth/guards/roles.guard");
const seed_service_1 = require("./seed/seed.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const databaseUrl = configService.get('DATABASE_URL');
                    if (databaseUrl) {
                        return {
                            type: 'postgres',
                            url: databaseUrl,
                            autoLoadEntities: true,
                            synchronize: configService.get('DB_SYNCHRONIZE'),
                            ssl: {
                                rejectUnauthorized: false,
                            },
                        };
                    }
                    const host = configService.get('DB_HOST');
                    const port = configService.get('DB_PORT');
                    const username = configService.get('DB_USERNAME');
                    const password = configService.get('DB_PASSWORD');
                    const database = configService.get('DB_DATABASE');
                    return {
                        type: 'postgres',
                        host,
                        port,
                        username,
                        password,
                        database,
                        autoLoadEntities: true,
                        synchronize: configService.get('DB_SYNCHRONIZE'),
                        ssl: {
                            rejectUnauthorized: false,
                        },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            employees_module_1.EmployeesModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            attendance_module_1.AttendanceModule,
            payroll_module_1.PayrollModule,
            leave_module_1.LeaveModule,
            training_module_1.TrainingModule,
            performance_module_1.PerformanceModule,
            access_module_1.AccessModule,
            feedback_module_1.FeedbackModule,
            dashboard_module_1.DashboardModule,
            events_module_1.EventsModule,
            notifications_module_1.NotificationsModule,
            messages_module_1.MessagesModule,
            chatbar_module_1.ChatbarModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
            seed_service_1.SeedService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map