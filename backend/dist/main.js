"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const dns_1 = require("dns");
const express_1 = require("express");
const app_module_1 = require("./app.module");
(0, dns_1.setDefaultResultOrder)('ipv4first');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, express_1.json)({ limit: '15mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '15mb' }));
    app.enableCors();
    app.setGlobalPrefix('api', {
        exclude: [{ path: '', method: common_1.RequestMethod.GET }],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map