import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto, UpdateRoomDto } from './dto';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRoomDto: CreateRoomDto) {
    return await this.roomService.create(createRoomDto);
  }

  @Get()
  async findAll(@Query() query: any) {
    return await this.roomService.findAll(query);
  }

  @Get('statistics')
  async getStatistics(@Query('campusId') campusId?: string) {
    return await this.roomService.getRoomStatistics(campusId);
  }

  @Get('available')
  async getAvailableRooms(@Query('campusId') campusId?: string) {
    return await this.roomService.getAvailableRooms(campusId);
  }

  @Get('building/:building')
  async getRoomsByBuilding(
    @Param('building') building: string,
    @Query('campusId') campusId?: string,
  ) {
    return await this.roomService.getRoomsByBuilding(building, campusId);
  }

  @Get('code/:roomCode')
  async findByRoomCode(@Param('roomCode') roomCode: string) {
    return await this.roomService.findByRoomCode(roomCode);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.roomService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateRoomDto: UpdateRoomDto
  ) {
    return await this.roomService.update(id, updateRoomDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return await this.roomService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.roomService.remove(id);
  }
}
