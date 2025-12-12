import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'Classroom Management System API',
      version: '1.0.0',
      description: 'API for IoT-based classroom management with AI authentication',
      features: [
        'Google OAuth Authentication',
        'Real-time WebSocket Communication',
        'IoT Locker Integration',
        'AI Face & Fingerprint Recognition',
      ],
      endpoints: {
        health: '/api/health',
        docs: '/api/docs (coming soon)',
      },
    };
  }
}
