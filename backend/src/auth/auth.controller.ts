import { Controller, Post, Body, Get, Request, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @Public()
    async login(@Body() body: any) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Post('register')
    @Public()
    async register(@Body() body: any) {
        return this.authService.register(body);
    }

    @Post('register-admin')
    @Public()
    async registerAdmin(@Body() body: any) {
        return this.authService.registerAdmin(body);
    }

    @Get('profile')
    getProfile(@Request() req: any) {
        return req.user;
    }

    @Post('change-password')
    async changePassword(@Request() req: any, @Body() body: any) {
        return this.authService.changePassword(req.user.id, body);
    }

    @Post('change-email')
    async changeEmail(@Request() req: any, @Body() body: any) {
        const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
        const isAdmin = roles.includes('ADMIN');

        if (!isAdmin) {
            throw new ForbiddenException('Only admins can change email addresses.');
        }

        return this.authService.changeEmail(req.user.id, body);
    }
}
