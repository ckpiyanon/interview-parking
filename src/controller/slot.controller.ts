import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CheckInRequest } from '~request/bill/check-in.request';
import { BillResponse } from '~response/bill/bill.response';
import { SlotResponse } from '~response/slot/slot.response';
import { BillService } from '~service/bill.service';
import { SlotService } from '~service/slot.service';

@Controller({ path: 'slots', version: ['1.0'] })
export class SlotController {
  constructor(
    private readonly slotService: SlotService,
    private readonly billService: BillService,
  ) {}

  @ApiTags('slots')
  @ApiOperation({ summary: 'delete a slot' })
  @ApiParam({
    name: 'slotId',
    type: 'integer',
    description: 'id of the slot',
    required: true,
  })
  @ApiOkResponse({ type: SlotResponse })
  @Delete('/:slotId')
  async deleteSlot(@Param('slotId', ParseIntPipe) slotId: number) {
    const response = await this.slotService.delete(slotId);
    return SlotResponse.toSlotResponse(response);
  }

  @ApiTags('slots')
  @ApiOperation({ summary: 'open the closed slot' })
  @ApiParam({
    name: 'slotId',
    type: 'integer',
    description: 'id of the slot',
    required: true,
  })
  @ApiOkResponse({ type: SlotResponse })
  @Post('/:slotId/open')
  @HttpCode(HttpStatus.OK)
  async openSlot(@Param('slotId', ParseIntPipe) slotId: number) {
    const response = await this.slotService.open(slotId);
    return SlotResponse.toSlotResponse(response);
  }

  @ApiTags('slots')
  @ApiOperation({ summary: 'close the slot' })
  @ApiParam({
    name: 'slotId',
    type: 'integer',
    description: 'id of the slot',
    required: true,
  })
  @ApiOkResponse({ type: SlotResponse })
  @Post('/:slotId/close')
  @HttpCode(HttpStatus.OK)
  async closeSlot(@Param('slotId', ParseIntPipe) slotId: number) {
    const response = await this.slotService.close(slotId);
    return SlotResponse.toSlotResponse(response);
  }

  @ApiTags('bills', 'slots')
  @ApiOperation({ summary: 'check-in to a slot' })
  @ApiParam({
    name: 'slotId',
    type: 'integer',
    description: 'id of the slot',
    required: true,
  })
  @ApiOkResponse({ type: BillResponse })
  @Post('/:slotId/check-in')
  @HttpCode(HttpStatus.OK)
  async checkIn(
    @Param('slotId', ParseIntPipe) slotId: number,
    @Body() details: CheckInRequest,
  ) {
    const response = await this.billService.checkIn(slotId, details);
    return BillResponse.toBillResponse(response);
  }
}
