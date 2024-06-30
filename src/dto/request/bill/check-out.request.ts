import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CheckOutRequest {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ type: 'number' })
  discount: number = 0;
}
