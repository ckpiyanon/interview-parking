import { Injectable } from '@nestjs/common';

import { name, version } from '../../package.json';

@Injectable()
export class HealthCheckService {
  getHealthCheck() {
    return {
      name,
      version,
      status: 'OK',
    };
  }
}
