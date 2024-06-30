import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SlotType } from '~entity/slot.entity';

export class CreateSlotRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string' })
  label: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string' })
  floor: string = '1';

  @IsIn(['car', 'motorcycle', 'bicycle', 'large', 'xlarge'])
  @ApiProperty({
    type: 'enum',
    enum: ['car', 'motorcycle', 'bicycle', 'large', 'xlarge'],
    enumName: 'SlotType',
  })
  type: SlotType = 'car';
}
