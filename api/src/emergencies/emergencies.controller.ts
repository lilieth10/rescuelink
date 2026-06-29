import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/auth.decorators';
import { EmergencyResponseDto } from './dto/emergency-response.dto';
import { EmergenciesService } from './emergencies.service';

@ApiTags('emergencies')
@Public()
@Controller('emergencies')
export class EmergenciesController {
  constructor(private readonly emergenciesService: EmergenciesService) {}

  @Get('active')
  @ApiOperation({ summary: 'Listar emergencias activas' })
  findActive(): Promise<EmergencyResponseDto[]> {
    return this.emergenciesService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener emergencia por ID' })
  findById(@Param('id') id: string): Promise<EmergencyResponseDto> {
    return this.emergenciesService.findById(id);
  }
}
