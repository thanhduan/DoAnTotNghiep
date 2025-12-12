import { Controller, Get } from '@nestjs/common';
import { CampusService } from './campus.service';

@Controller('campus')
export class CampusController {
  constructor(private campusService: CampusService) {}

  /**
   * GET /api/campus
   * Get all active campuses for selection
   */
  @Get()
  async getAllCampuses() {
    return this.campusService.getAllActiveCampuses();
  }

  /**
   * GET /api/campus/:id
   * Get campus by ID
   */
  @Get(':id')
  async getCampusById(id: string) {
    return this.campusService.getCampusById(id);
  }
}
