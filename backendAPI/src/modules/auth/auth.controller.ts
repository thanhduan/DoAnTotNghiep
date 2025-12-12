import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/database/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) { }

  /**
   * GET /api/auth/google/login?campusId=xxx
   * Initiate Google OAuth login with campus selection
   */
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(
    @Query('campusId') campusId: string,
    @Req() req: any,
  ): Promise<void> {
    // Guard will redirect to Google
    // campusId will be passed as 'state' parameter in GoogleStrategy
  }

  /**
   * GET /api/auth/google/callback
   * Google OAuth callback handler
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: any, @Res() res: Response) {
    try {


      const { user } = req;

      // Validate and login user
      const result = await this.authService.validateGoogleUser(
        user,
        user.campusId,
      );



      // Get frontend URL from config
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');

      // Redirect to frontend with token
      const redirectUrl = `${frontendUrl}/auth/callback?token=${result.accessToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`;

      console.log('🔄 Redirecting to:', redirectUrl);
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Auth error:', error.message);

      // Redirect to frontend with error
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const errorUrl = `${frontendUrl}/login?error=${encodeURIComponent(error.message)}`;

      console.log('🔄 Redirecting to error page:', errorUrl);
      return res.redirect(errorUrl);
    }
  }

  /**
   * GET /api/auth/profile
   * Get current user profile (protected route)
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user._id.toString());
  }

  /**
   * POST /api/auth/logout
   * Logout current user
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: User) {
    return this.authService.logout(user._id.toString());
  }

  /**
   * GET /api/auth/check
   * Check if user is authenticated
   */
  @Get('check')
  @UseGuards(JwtAuthGuard)
  async checkAuth(@CurrentUser() user: User) {
    return {
      success: true,
      authenticated: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
