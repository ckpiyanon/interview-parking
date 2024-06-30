import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { HealthCheckService } from '~service/health-check.service';

@ApiTags('health-check')
@Controller({ path: 'health-check', version: VERSION_NEUTRAL })
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}
  @Get()
  @ApiOkResponse({
    schema: {
      properties: {
        name: { type: 'string' },
        version: { type: 'string' },
        status: { type: 'string' },
      },
    },
  })
  healthCheck() {
    return this.healthCheckService.getHealthCheck();
  }
}
