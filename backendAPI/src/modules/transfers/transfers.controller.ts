import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CampusScopeGuard } from '@/common/guards/campus-scope.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Controller('transfers')
@UseGuards(JwtAuthGuard, CampusScopeGuard, PermissionsGuard)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @RequirePermissions('transfers.create')
  async create(@Body() dto: CreateTransferDto, @CurrentUser() user: any) {
    const result = await this.transfersService.create(dto, user);
    return { success: true, data: result };
  }

  @Patch(':id/cancel')
  @RequirePermissions('transfers.cancel')
  async cancel(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.transfersService.cancel(id, user);
    return { success: true, data: result };
  }
}
