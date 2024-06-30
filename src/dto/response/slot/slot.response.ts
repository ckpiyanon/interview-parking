import { Slot, SlotStatus, SlotType } from '~entity/slot.entity';
import { omit } from 'lodash';
import { ApiProperty } from '@nestjs/swagger';

export class SlotResponse {
  @ApiProperty({ type: 'integer' })
  id: number;

  @ApiProperty({ type: 'integer' })
  buildingId: number;

  @ApiProperty({ type: 'string' })
  label: string;

  @ApiProperty({ type: 'string' })
  floor: string;

  @ApiProperty({
    type: 'enum',
    enum: ['car', 'motorcycle', 'bicycle', 'large', 'xlarge'],
    enumName: 'SlotType',
  })
  type: SlotType;

  @ApiProperty({
    type: 'enum',
    enum: ['vacant', 'occupied', 'closed'],
    enumName: 'SlotStatus',
  })
  status: SlotStatus;

  static toSlotResponse(slot: Slot): SlotResponse;
  static toSlotResponse(slots: Slot[]): SlotResponse[];
  static toSlotResponse(
    arg: Slot | Slot[],
  ): SlotResponse | SlotResponse[] | undefined {
    if (!arg) {
      return undefined;
    }

    const isArray = Array.isArray(arg);
    if (isArray && !arg.length) {
      return undefined;
    }

    const list = isArray ? arg : [arg];
    const result = list.map<SlotResponse>((slot) => ({
      ...omit(slot, 'building', 'bill'),
    }));
    return isArray ? result : result[0];
  }
}
