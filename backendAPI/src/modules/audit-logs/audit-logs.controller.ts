import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  /**
   * GET /api/audit-logs
   * View audit log content
   */
  @Get()
  @RequirePermissions('logs.read')
  async getLogContent() {
    const content = await this.auditLogsService.getLogContent();
    return {
      success: true,
      data: content,
    };
  }

  /**
   * GET /api/audit-logs/download
   * Download audit log file
   */
  @Get('download')
  @RequirePermissions('logs.read')
  async downloadLog(@Res() res: Response) {
    const stream = await this.auditLogsService.getLogStream();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-log.txt"');
    stream.pipe(res);
  }
}
