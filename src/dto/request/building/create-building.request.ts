import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateSlotRequest } from '~request/slot/create-slot.request';

export class CreateBuildingRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string' })
  description?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({ type: [CreateSlotRequest] })
  slots?: Array<CreateSlotRequest>;
}
