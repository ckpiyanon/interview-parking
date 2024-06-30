import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseConfig } from '~config/database.config';
import { BillController } from '~controller/bill.controller';
import { BuildingController } from '~controller/building.controller';
import { HealthCheckController } from '~controller/health-check.controller';
import { ParkController } from '~controller/park.controller';
import { SlotController } from '~controller/slot.controller';
import { Bill } from '~entity/bill.entity';
import { Building } from '~entity/building.entity';
import { Park } from '~entity/park.entity';
import { Slot } from '~entity/slot.entity';
import { BillService } from '~service/bill.service';
import { BuildingService } from '~service/building.service';
import { HealthCheckService } from '~service/health-check.service';
import { ParkService } from '~service/park.service';
import { ReportService } from '~service/report.service';
import { SlotService } from '~service/slot.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = new DatabaseConfig(configService);
        return dbConfig.getTypeORMConfig([Bill, Building, Park, Slot]);
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Bill, Building, Park, Slot]),
  ],
  controllers: [
    HealthCheckController,
    ParkController,
    BuildingController,
    SlotController,
    BillController,
  ],
  providers: [
    HealthCheckService,
    ConfigService,
    ParkService,
    BuildingService,
    SlotService,
    BillService,
    ReportService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ transform: true }),
    },
  ],
})
export class AppModule {}
