import { ApiProperty } from '@nestjs/swagger';
import { Park } from '~entity/park.entity';
import { BuildingResponse } from '~response/building/building.response';

export class ParkResponse {
  @ApiProperty({ type: 'integer' })
  id: number;

  @ApiProperty({ type: 'string' })
  name: string;

  @ApiProperty({ type: 'string' })
  description?: string;

  @ApiProperty({
    type: 'object',
    properties: {
      latitude: { type: 'number' },
      longitude: { type: 'number' },
    },
  })
  location: { latitude: number; longitude: number };

  @ApiProperty({ type: 'string' })
  costDescription?: string;

  @ApiProperty({ type: 'integer' })
  fixedFirstPeriod: number;

  @ApiProperty({ type: 'number' })
  fixedFirstPeriodCost: number;

  @ApiProperty({ type: 'number' })
  hourlyCost: number;

  @ApiProperty({ type: [BuildingResponse] })
  buildings?: BuildingResponse[];

  static toParkResponse(park: Park): ParkResponse;
  static toParkResponse(parks: Park[]): ParkResponse[];
  static toParkResponse(arg: Park | Park[]): ParkResponse | ParkResponse[] {
    const isArray = Array.isArray(arg);
    const list = isArray ? arg : [arg];
    const result = list.map<ParkResponse>(
      ({ location, buildings, ...park }) => ({
        ...park,
        location: {
          latitude: location.coordinates[1],
          longitude: location.coordinates[0],
        },
        buildings: buildings && BuildingResponse.toBuildingResponse(buildings),
      }),
    );
    return isArray ? result : result[0];
  }
}
