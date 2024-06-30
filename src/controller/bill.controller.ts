import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CheckOutRequest } from '~request/bill/check-out.request';
import { BillResponse } from '~response/bill/bill.response';
import { BillService } from '~service/bill.service';

@Controller({ path: 'bills', version: ['1.0'] })
export class BillController {
  constructor(private readonly billService: BillService) {}

  @ApiTags('bills')
  @ApiOperation({ summary: 'check-out the bill' })
  @ApiParam({
    name: 'billCode',
    type: 'string',
    description: 'bill code',
    required: true,
  })
  @ApiOkResponse({ type: BillResponse })
  @Post('/:billCode/check-out')
  @HttpCode(HttpStatus.OK)
  async checkOut(
    @Param('billCode') billCode: string,
    @Body() details: CheckOutRequest,
  ) {
    const response = await this.billService.checkout(billCode, details);
    return BillResponse.toBillResponse(response);
  }
}
