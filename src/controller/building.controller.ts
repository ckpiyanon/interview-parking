import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SlotType } from '~entity/slot.entity';

import { CheckInRequest } from '~request/bill/check-in.request';
import { CreateSlotRequest } from '~request/slot/create-slot.request';
import { BillResponse } from '~response/bill/bill.response';
import { BuildingResponse } from '~response/building/building.response';
import { SlotResponse } from '~response/slot/slot.response';
import { BillService } from '~service/bill.service';
import { BuildingService } from '~service/building.service';
import { SlotService } from '~service/slot.service';

@Controller({ path: 'buildings', version: ['1.0'] })
export class BuildingController {
  constructor(
    private readonly buildingService: BuildingService,
    private readonly slotService: SlotService,
    private readonly billService: BillService,
  ) {}

  @ApiTags('buildings')
  @ApiOperation({ summary: 'delete a building along with slots' })
  @ApiParam({
    name: 'buildingId',
    type: 'integer',
    description: 'id of the building',
    required: true,
  })
  @ApiOkResponse({ type: BuildingResponse })
  @Delete('/:buildingId')
  async deleteBuilding(@Param('buildingId', ParseIntPipe) buildingId: number) {
    const response = await this.buildingService.delete(buildingId);
    return BuildingResponse.toBuildingResponse(response);
  }

  @ApiTags('slots')
  @ApiOperation({ summary: 'create slots in the building' })
  @ApiParam({
    name: 'buildingId',
    type: 'integer',
    description: 'id of the building',
    required: true,
  })
  @ApiCreatedResponse({ type: [SlotResponse] })
  @Put('/:buildingId/slots')
  @HttpCode(HttpStatus.CREATED)
  async createSlots(
    @Param('buildingId', ParseIntPipe) buildingId: number,
    @Body() slotDetails: CreateSlotRequest | CreateSlotRequest[],
  ) {
    const response = await this.slotService.create(
      buildingId,
      Array.isArray(slotDetails) ? slotDetails : [slotDetails],
    );
    return SlotResponse.toSlotResponse(response);
  }

  @ApiTags('bills', 'buildings')
  @ApiOperation({ summary: 'check-in using building id' })
  @ApiParam({
    name: 'buildingId',
    type: 'integer',
    description: 'id of the building',
    required: true,
  })
  @ApiOkResponse({ type: BillResponse })
  @Post('/:buildingId/check-in')
  @HttpCode(HttpStatus.OK)
  async checkIn(
    @Param('buildingId', ParseIntPipe) buildingId: number,
    @Query('type') type: SlotType,
    @Body() details: CheckInRequest,
  ) {
    const response = await this.billService.checkInByBuilding(
      buildingId,
      type || 'car',
      details,
    );
    return BillResponse.toBillResponse(response);
  }
}
