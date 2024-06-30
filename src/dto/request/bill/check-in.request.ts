import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckInRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string' })
  carPlateNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string' })
  carPlateProvince: string;
}
