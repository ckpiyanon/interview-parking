import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { Bill } from '~entity/bill.entity';
import { Slot } from '~entity/slot.entity';
import { Building } from '~entity/building.entity';
import { Park } from '~entity/park.entity';
import { Report } from '~type/report.type';

export type ReportType = 'daily' | 'weekly' | 'monthly';
const TIMEZONE = 'Asia/Bangkok';

const reportTypeMap: Record<ReportType, string> = {
  daily: 'DOY',
  weekly: 'WEEK',
  monthly: 'MONTH',
};

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.extend(dayOfYear);
dayjs.extend(isoWeek);

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async generateReport(parkId: number, type: ReportType): Promise<Report[]> {
    const result = await this.dataSource
      .createQueryBuilder()
      .from(Bill, 'bills')
      .innerJoin(Slot, 'slots', 'bills.slot_id = slots.id')
      .innerJoin(Building, 'buildings', 'slots.building_id = buildings.id')
      .innerJoin(
        Park,
        'parks',
        'buildings.park_id = parks.id AND parks.id = :parkId',
        { parkId },
      )
      .addSelect('parks.id', 'parkId')
      .addSelect('parks.name', 'parkName')
      .addSelect('SUM(bills.amount)', 'amount')
      .addSelect('MIN(bills.check_in_time)', 'firstCheckInTime')
      .addSelect(
        `EXTRACT(${reportTypeMap[type]} FROM bills.check_in_time AT TIME ZONE 'Asia/Bangkok')`,
        'period',
      )
      .addGroupBy('parks.id')
      .addGroupBy('parks.name')
      .addSelect(
        `EXTRACT(YEAR FROM bills.check_out_time AT TIME ZONE 'Asia/Bangkok')`,
        'year',
      )
      .addGroupBy(
        `EXTRACT(YEAR FROM bills.check_out_time AT TIME ZONE 'Asia/Bangkok')`,
      )
      .addGroupBy(
        `EXTRACT(${reportTypeMap[type]} FROM bills.check_in_time AT TIME ZONE 'Asia/Bangkok')`,
      )
      .getRawMany<
        Report & {
          period: number;
          year: number;
          firstCheckInTime: Date;
        }
      >();
    return result.map<Report>(({ period, year, ...data }) => ({
      ...data,
      beginDate: (() => {
        const date = dayjs().tz(TIMEZONE).set('year', year);
        switch (type) {
          case 'daily':
            return date.dayOfYear(period);
          case 'weekly':
            return date.isoWeek(period);
          case 'monthly':
            return date.month(period);
        }
      })()
        .startOf('day')
        .toDate(),
      endDate: (() => {
        const date = dayjs().tz(TIMEZONE).set('year', year);
        switch (type) {
          case 'daily':
            return date.dayOfYear(period);
          case 'weekly':
            return date.isoWeek(period).endOf('week');
          case 'monthly':
            return date.month(period).endOf('month');
        }
      })()
        .endOf('day')
        .toDate(),
    }));
  }
}
