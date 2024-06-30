// This file is not to be included in any code, used for migration only

import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Bill } from '~entity/bill.entity';
import { Building } from '~entity/building.entity';
import { Park } from '~entity/park.entity';
import { Slot } from '~entity/slot.entity';

export const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.PORT || '5432'),
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  entities: [Bill, Building, Park, Slot],
  migrations: ['./dist/migration/**/*'],
  migrationsTableName: '_typeorm_migration',
  synchronize: true,
};

export default new DataSource(config);
