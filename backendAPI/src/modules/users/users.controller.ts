import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create new user (Admin only)
   * POST /api/users
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.TRAINING_STAFF)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      success: true,
      message: 'Tạo user thành công',
      data: user,
    };
  }

  /**
   * Get all users with filters
   * GET /api/users
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.TRAINING_STAFF)
  async findAll(@Query() filterDto: FilterUserDto) {
    const users = await this.usersService.findAll(filterDto);
    return {
      success: true,
      data: users,
    };
  }

  /**
   * Get user statistics
   * GET /api/users/statistics
   */
  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.TRAINING_STAFF)
  async getStatistics() {
    const stats = await this.usersService.getStatistics();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TRAINING_STAFF)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return {
      success: true,
      data: user,
    };
  }

  /**
   * Update user
   * PUT /api/users/:id
   */
  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TRAINING_STAFF)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      success: true,
      message: 'Cập nhật user thành công',
      data: user,
    };
  }

  /**
   * Activate user
   * PUT /api/users/:id/activate
   */
  @Put(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.TRAINING_STAFF)
  async activate(@Param('id') id: string) {
    const user = await this.usersService.activate(id);
    return {
      success: true,
      message: 'Kích hoạt user thành công',
      data: user,
    };
  }

  /**
   * Delete user (soft delete)
   * DELETE /api/users/:id
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return {
      success: true,
      message: 'Xóa user thành công',
    };
  }
}
