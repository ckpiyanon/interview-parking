import { ApiProperty } from '@nestjs/swagger';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { pick } from 'lodash';

import { Report } from '~type/report.type';

dayjs.extend(utc);
dayjs.extend(timezone);

export class ReportResponse {
  @ApiProperty({ type: 'string' })
  beginDate: Date | string;

  @ApiProperty({ type: 'string' })
  endDate: Date | string;

  @ApiProperty({ type: 'integer' })
  parkId: number;

  @ApiProperty({ type: 'string' })
  parkName: string;

  @ApiProperty({ type: 'number' })
  amount: number;

  static toReportResponse(report: Report): ReportResponse;
  static toReportResponse(reports: Report[]): ReportResponse[];
  static toReportResponse(
    arg: Report | Report[],
  ): ReportResponse | ReportResponse[] {
    const isArray = Array.isArray(arg);
    const list = isArray ? arg : [arg];
    const result = list.map<ReportResponse>((report) =>
      pick(report, ['beginDate', 'endDate', 'parkId', 'parkName', 'amount']),
    );
    return isArray ? result : result[0];
  }
}
