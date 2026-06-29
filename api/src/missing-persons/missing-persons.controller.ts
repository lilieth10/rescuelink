import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/auth.decorators';
import { CreateMissingPersonDto } from './dto/create-missing-person.dto';
import { MissingPersonResponseDto } from './dto/missing-person-response.dto';
import { QueryMissingPersonsDto } from './dto/query-missing-persons.dto';
import { MissingPersonsService } from './missing-persons.service';

@ApiTags('missing-persons')
@Public()
@Controller('missing-persons')
export class MissingPersonsController {
  constructor(private readonly missingPersonsService: MissingPersonsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar personas desaparecidas por emergencia' })
  findAll(
    @Query() query: QueryMissingPersonsDto,
  ): Promise<MissingPersonResponseDto[]> {
    return this.missingPersonsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener persona desaparecida por ID' })
  findById(@Param('id') id: string): Promise<MissingPersonResponseDto> {
    return this.missingPersonsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar persona desaparecida' })
  create(
    @Body() dto: CreateMissingPersonDto,
  ): Promise<MissingPersonResponseDto> {
    return this.missingPersonsService.create(dto);
  }
}
