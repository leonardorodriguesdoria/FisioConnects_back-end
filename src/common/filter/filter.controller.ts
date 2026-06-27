import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FilterService } from './filter.service';
import { FilterUsersDTO } from './dto/create-filter.dto';


@Controller('filter')
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  @Get()
  async getAll(@Query() filters: FilterUsersDTO){
    return this.filterService.findAll(filters)
  }
}
