import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { LockerService } from './locker.service';
import { CreateLockerDto } from './dto/create-locker.dto';
import { UpdateLockerDto } from './dto/update-locker.dto';

@Controller('lockers')
export class LockerController {
  constructor(private readonly lockerService: LockerService) {}

  // ===== CREATE =====
  @Post()
  create(@Body() dto: CreateLockerDto) {
    return this.lockerService.create(dto);
  }

  // ===== GET LIST =====
  @Get()
  findAll(@Query() query: any) {
    return this.lockerService.findAll(query);
  }

  @Get('iot')
  findAllWithIoT(@Query() query: any) {
    return this.lockerService.findAllWithIoT(query);
  }

  // ===== ESP32 (PHẢI TRƯỚC :id) =====
  @Post('esp32/heartbeat')
  reportHeartbeat(
    @Body() body: { deviceEsp32: string; solenoids: any[] },
  ) {
    return this.lockerService.reportHeartbeat(
      body.deviceEsp32,
      body.solenoids,
    );
  }

  @Post('esp32/command')
  sendCommand(
    @Body()
    body: { deviceEsp32: string; idSolenoid: string; action: string },
  ) {
    return this.lockerService.sendCommand(
      body.deviceEsp32,
      body.idSolenoid,
      body.action,
    );
  }

  // ===== ID ROUTES (LUÔN CUỐI) =====
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lockerService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLockerDto) {
    return this.lockerService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lockerService.remove(id);
  }
}
