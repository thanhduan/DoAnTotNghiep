import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CampusScopeGuard } from '@/common/guards/campus-scope.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { ScopeGuard } from '@/common/guards/scope.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { RequireScopes } from '@/common/decorators/scopes.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('bookings')
@UseGuards(JwtAuthGuard, CampusScopeGuard, PermissionsGuard, ScopeGuard)
@RequirePermissions('bookings.manage')
@RequireScopes('CAMPUS')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async create(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: any,
    @Req() request: any,
  ) {
    const data = await this.bookingService.create(dto, user, request.campusFilter);
    return {
      success: true,
      message: 'Tạo booking thành công',
      data,
    };
  }

  @Get()
  async findAll(
    @Query() query: QueryBookingDto,
    @CurrentUser() user: any,
    @Req() request: any,
  ) {
    const data = await this.bookingService.findAll(query, user, request.campusFilter);
    return {
      success: true,
      data,
      total: data.length,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any, @Req() request: any) {
    const data = await this.bookingService.findOne(id, user, request.campusFilter);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
    @CurrentUser() user: any,
    @Req() request: any,
  ) {
    const data = await this.bookingService.update(id, dto, user, request.campusFilter);
    return {
      success: true,
      message: 'Cập nhật booking thành công',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any, @Req() request: any) {
    await this.bookingService.remove(id, user, request.campusFilter);
    return {
      success: true,
      message: 'Xóa booking thành công',
    };
  }
}
