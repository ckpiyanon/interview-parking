import { ApiProperty } from '@nestjs/swagger';
import { Bill } from '~entity/bill.entity';
import { SlotResponse } from '~response/slot/slot.response';

export class BillResponse {
  @ApiProperty({ type: 'integer' })
  id: number;

  @ApiProperty({ type: 'integer' })
  slotId: number;

  @ApiProperty({ type: 'string' })
  code: string;

  @ApiProperty({ type: 'string' })
  checkInTime: Date;

  @ApiProperty({ type: 'string' })
  checkOutTime?: Date;

  @ApiProperty({ type: 'string' })
  carPlateNumber: string;

  @ApiProperty({ type: 'string' })
  carPlateProvince: string;

  @ApiProperty({ type: 'number' })
  amount: number;

  @ApiProperty({ type: 'number' })
  discount: number;

  @ApiProperty({ type: SlotResponse })
  slot?: SlotResponse;

  static toBillResponse({ slot, ...bill }: Bill): BillResponse {
    return {
      ...bill,
      slot: slot && SlotResponse.toSlotResponse(slot),
    };
  }
}
