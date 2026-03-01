import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ScheduleService } from './schedule.service';
import { ImportScheduleDto } from './dto/import-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CampusScopeGuard } from '@/common/guards/campus-scope.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('schedules')
@UseGuards(JwtAuthGuard, CampusScopeGuard, PermissionsGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // POST /schedules/import - CSV/Excel import (formats: .csv, .xlsx, .xls)
  @Post('import')
  @RequirePermissions('schedules.create')
  @UseInterceptors(FileInterceptor('file'))
  async importSchedules(
    @UploadedFile() file: any,
    @Body() dto: ImportScheduleDto,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('Bạn chưa chọn file nào');
    }

    // Validate file type (CSV or Excel)
    const fileName = file.originalname?.toLowerCase() || '';
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValid) {
      throw new BadRequestException('Chỉ chấp nhận file CSV hoặc Excel (.csv, .xlsx, .xls)');
    }

    const result = await this.scheduleService.importSchedules(
      file,
      dto.mode || 'strict',
      user,
    );

    return {
      success: true,
      message:
        dto.mode === 'dryRun'
          ? 'Đã kiểm tra xong file'
          : `Đã nhập ${result.inserted}/${result.total} lịch học`,
      data: result,
    };
  }

  // GET /schedules - Query with filters (startDate, endDate, roomId, lecturerId, etc.)
  @Get()
  @RequirePermissions('schedules.read')
  async findAll(@Query() query: QueryScheduleDto, @CurrentUser() user: any) {
    const schedules = await this.scheduleService.findAll(query, user);

    return {
      success: true,
      data: schedules,
      total: schedules.length,
    };
  }

  // GET /schedules/:id
  @Get(':id')
  @RequirePermissions('schedules.read')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const schedule = await this.scheduleService.findOne(id, user);

    return {
      success: true,
      data: schedule,
    };
  }

  // PATCH /schedules/:id
  @Patch(':id')
  @RequirePermissions('schedules.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
    @CurrentUser() user: any,
  ) {
    const updated = await this.scheduleService.update(id, dto, user);

    return {
      success: true,
      message: 'Đã cập nhật lịch học',
      data: updated,
    };
  }

  // DELETE /schedules/:id
  @Delete(':id')
  @RequirePermissions('schedules.delete')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.scheduleService.remove(id, user);

    return {
      success: true,
      message: 'Đã xóa lịch học',
    };
  }
}
