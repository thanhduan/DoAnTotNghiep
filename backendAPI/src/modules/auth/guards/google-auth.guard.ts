import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const campusId = request.query.campusId;
    
    console.log('🔍 GoogleAuthGuard - campusId from query:', campusId);
    
    return {
      // Pass campusId as state parameter to Google OAuth
      state: campusId || '',
    };
  }
}

