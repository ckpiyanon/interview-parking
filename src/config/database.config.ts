import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export class DatabaseConfig {
  constructor(private readonly configService: ConfigService) {}

  getTypeORMConfig(entities: any[]): TypeOrmModuleOptions {
    console.log('dbname', this.configService.get('DB_NAME'));
    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST', 'localhost'),
      port: parseInt(this.configService.get('DB_PORT', '5432')),
      database: this.configService.get('DB_NAME', 'parking'),
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD'),
      entities,
      synchronize: false,
      logging: true,
    };
  }
}
