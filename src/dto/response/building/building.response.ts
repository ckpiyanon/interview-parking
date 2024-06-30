import { Building } from '~entity/building.entity';
import { omit } from 'lodash';
import { SlotResponse } from '~response/slot/slot.response';
import { ApiProperty } from '@nestjs/swagger';

export class BuildingResponse {
  @ApiProperty({ type: 'integer' })
  id: number;

  @ApiProperty({ type: 'integer' })
  parkId: number;

  @ApiProperty({ type: 'string' })
  name: string;

  @ApiProperty({ type: 'string' })
  description?: string;

  @ApiProperty({ type: 'integer' })
  capacity: number;

  @ApiProperty({ type: [SlotResponse] })
  slots?: SlotResponse[];

  static toBuildingResponse(building: Building): BuildingResponse;
  static toBuildingResponse(buildings: Building[]): BuildingResponse[];
  static toBuildingResponse(
    arg: Building | Building[],
  ): BuildingResponse | BuildingResponse[] | undefined {
    if (!arg) {
      return undefined;
    }
    const isArray = Array.isArray(arg);
    const list = isArray ? arg : [arg];
    const result = list.map<BuildingResponse>(({ slots, ...building }) => ({
      ...omit(building, 'park'),
      slots: slots && SlotResponse.toSlotResponse(slots),
    }));
    return isArray ? result : result[0];
  }
}
