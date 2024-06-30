import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateBuildingRequest } from '~request/building/create-building.request';

class LocationRequest {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class CreateParkRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string' })
  description?: string;

  @IsObject()
  @ApiProperty({
    type: 'object',
    properties: {
      latitude: { type: 'number' },
      longitude: { type: 'number' },
    },
  })
  location: LocationRequest;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string' })
  costDescription?: string;

  @IsNumber({ maxDecimalPlaces: 0 })
  @IsOptional()
  @ApiProperty({ type: 'integer' })
  fixedFirstPeriod: number = 0;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ type: 'number' })
  fixedFirstPeriodCost: number = 0;

  @IsNumber()
  @ApiProperty({ type: 'number' })
  hourlyCost: number;

  @IsArray()
  @IsOptional()
  @ApiProperty({ type: [CreateBuildingRequest] })
  buildings?: Array<CreateBuildingRequest>;
}
