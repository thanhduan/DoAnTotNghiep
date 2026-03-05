import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CampusScopeGuard } from '@/common/guards/campus-scope.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

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
}
