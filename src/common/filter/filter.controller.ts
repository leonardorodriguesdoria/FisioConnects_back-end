import { Controller, Get, Query } from '@nestjs/common';
import { FilterService } from './filter.service';
import { FilterUsersDTO } from './dto/create-filter.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfessionalPublicProfileDto } from 'src/professional/dto/professional-response.dto';
import { ApiValidationError } from '../swagger/api-docs.decorators';


@ApiTags('Busca')
@Controller('filter')
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  @ApiOperation({
    summary: 'Busca profissionais com filtros',
    description:
      'Rota pública. Todos os filtros são opcionais e combinados entre si (E). A comparação ignora acentos e ' +
      'maiúsculas/minúsculas e aceita trechos (ex.: `sao` encontra "São Paulo"). Sem filtros, retorna todos os profissionais. ' +
      'Resultados ordenados por nome.',
  })
  @ApiOkResponse({ description: 'Profissionais encontrados (lista vazia quando nenhum corresponde aos filtros)', type: [ProfessionalPublicProfileDto] })
  @ApiValidationError()
  @Get()
  async getAll(@Query() filters: FilterUsersDTO){
    return this.filterService.findAll(filters)
  }
}
