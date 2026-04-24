import { ConfigService } from '@nestjs/config';

export function getJwtSecret(configService: ConfigService): string {
  const configured = configService.get<string>('JWT_SECRET') ?? process.env.JWT_SECRET;
  if (configured) return configured;

  const nodeEnv = configService.get<string>('NODE_ENV') ?? process.env.NODE_ENV;
  if (nodeEnv !== 'production') {
    // Local/dev fallback so the backend can boot even when JWT_SECRET isn't set.
    return 'dev-jwt-secret';
  }

  throw new Error('JWT_SECRET is not configured. Set JWT_SECRET in environment variables.');
}

