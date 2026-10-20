import { Controller, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FilterService } from './filter.service';
import { FilterUsersDTO } from './dto/create-filter.dto';


@Controller('filter')
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  // A busca da toolbar dispara enquanto o usuário digita, então o limite global (10/min) é baixo demais
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @Get()
  async getAll(@Query() filters: FilterUsersDTO){
    return this.filterService.findAll(filters)
  }
}
