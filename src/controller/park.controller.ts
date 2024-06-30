import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { Building } from '~entity/building.entity';
import { SlotType } from '~entity/slot.entity';

import { CheckInRequest } from '~request/bill/check-in.request';
import { CreateBuildingRequest } from '~request/building/create-building.request';
import { CreateParkRequest } from '~request/park/create-park.request';
import { BillResponse } from '~response/bill/bill.response';
import { BuildingResponse } from '~response/building/building.response';
import { ParkResponse } from '~response/park/park.response';
import { ReportResponse } from '~response/report/report.response';
import { BillService } from '~service/bill.service';
import { BuildingService } from '~service/building.service';
import { ParkService } from '~service/park.service';
import { ReportService, ReportType } from '~service/report.service';

@Controller({ path: 'parks', version: ['1.0'] })
export class ParkController {
  private readonly logger = new Logger(ParkController.name);

  constructor(
    private readonly parkService: ParkService,
    private readonly buildingService: BuildingService,
    private readonly billService: BillService,
    private readonly reportService: ReportService,
  ) {}

  @ApiTags('parks')
  @ApiOperation({
    summary: 'create a new park, can be created along with buildings and slots',
  })
  @ApiCreatedResponse({ type: ParkResponse })
  @Put()
  @HttpCode(HttpStatus.CREATED)
  async createPark(@Body() parkDetails: CreateParkRequest) {
    const response = await this.parkService.create(parkDetails);
    return ParkResponse.toParkResponse(response);
  }

  @ApiTags('parks')
  @ApiOperation({
    summary:
      'list parks nearby if latitude and longitude is provided, else list all parks',
  })
  @ApiQuery({
    name: 'latitude',
    type: 'number',
    description: 'latitude of the location to find',
    required: false,
  })
  @ApiQuery({
    name: 'longitude',
    type: 'number',
    description: 'longitude of the location to find',
    required: false,
  })
  @ApiQuery({
    name: 'distance',
    type: 'number',
    description: '(default: 2) radius to find from the location in kilometers',
    required: false,
  })
  @ApiQuery({
    name: 'only_vacant',
    type: 'boolean',
    description:
      '(default: false) whether to list only parks with vacant slot(s)',
    required: false,
  })
  @ApiOkResponse({ type: [ParkResponse] })
  @Get()
  async listParks(
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('distance') distance: string = '2',
    @Query('only_vacant') onlyVacant: string = 'false',
  ) {
    const response = await this.parkService.find({
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      distance: parseFloat(distance),
      onlyVacant: onlyVacant === 'true',
    });
    return ParkResponse.toParkResponse(response);
  }

  @ApiTags('parks')
  @ApiOperation({
    summary: 'get info of a park',
  })
  @ApiParam({
    name: 'parkId',
    type: 'integer',
    description: 'id of the park',
    required: true,
  })
  @ApiOkResponse({ type: ParkResponse })
  @Get('/:parkId')
  async getPark(@Param('parkId', ParseIntPipe) parkId: number) {
    const response = await this.parkService.get(parkId);
    return ParkResponse.toParkResponse(response);
  }

  @ApiTags('parks')
  @ApiOperation({
    summary: 'delete a park along with buildings and slots',
  })
  @ApiParam({
    name: 'parkId',
    type: 'integer',
    description: 'id of the park',
    required: true,
  })
  @ApiOkResponse({ type: ParkResponse })
  @Delete('/:parkId')
  async deletePark(@Param('parkId', ParseIntPipe) parkId: number) {
    const response = await this.parkService.delete(parkId);
    return ParkResponse.toParkResponse(response);
  }

  @ApiTags('buildings')
  @ApiOperation({
    summary: 'create a new building, can be created along with slots',
  })
  @ApiParam({
    name: 'parkId',
    type: 'integer',
    description: 'id of the park to create building in',
    required: true,
  })
  @ApiCreatedResponse({ type: Building })
  @Put('/:parkId/buildings')
  @HttpCode(HttpStatus.CREATED)
  async createBuilding(
    @Param('parkId', ParseIntPipe)
    parkId: number,
    @Body() buildingDetails: CreateBuildingRequest,
  ) {
    const response = await this.buildingService.create(parkId, buildingDetails);
    return BuildingResponse.toBuildingResponse(response);
  }

  @ApiTags('bills', 'parks')
  @ApiOperation({ summary: 'check-in using park id' })
  @ApiParam({
    name: 'parkId',
    type: 'integer',
    description: 'id of the park to create building in',
    required: true,
  })
  @ApiOkResponse({ type: BillResponse })
  @Post('/:parkId/check-in')
  @HttpCode(HttpStatus.OK)
  async checkIn(
    @Param('parkId', ParseIntPipe) parkId: number,
    @Query('type') type: SlotType,
    @Body() details: CheckInRequest,
  ) {
    const response = await this.billService.checkInByPark(
      parkId,
      type || 'car',
      details,
    );
    return BillResponse.toBillResponse(response);
  }

  @ApiTags('reports')
  @ApiOperation({ summary: 'get the amount report for each park' })
  @ApiParam({
    name: 'parkId',
    type: 'integer',
    description: 'id of the park to create building in',
    required: true,
  })
  @ApiQuery({
    name: 'type',
    type: 'enum',
    enum: ['daily', 'weekly', 'monthly'],
    description: 'type of report (default: "monthly")',
    required: false,
  })
  @ApiOkResponse({ type: [ReportResponse] })
  @Get('/:parkId/report')
  async report(
    @Param('parkId', ParseIntPipe) parkId: number,
    @Query('type') type: ReportType = 'monthly',
  ) {
    const response = await this.reportService.generateReport(parkId, type);
    return ReportResponse.toReportResponse(response);
  }
}
