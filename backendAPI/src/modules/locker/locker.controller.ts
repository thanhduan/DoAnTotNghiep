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

  @Post()
  create(@Body() dto: CreateLockerDto) {
    return this.lockerService.create(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.lockerService.findAll(query);
  }

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
