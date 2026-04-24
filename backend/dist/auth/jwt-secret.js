"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtSecret = getJwtSecret;
function getJwtSecret(configService) {
    const configured = configService.get('JWT_SECRET') ?? process.env.JWT_SECRET;
    if (configured)
        return configured;
    const nodeEnv = configService.get('NODE_ENV') ?? process.env.NODE_ENV;
    if (nodeEnv !== 'production') {
        return 'dev-jwt-secret';
    }
    throw new Error('JWT_SECRET is not configured. Set JWT_SECRET in environment variables.');
}
//# sourceMappingURL=jwt-secret.js.map