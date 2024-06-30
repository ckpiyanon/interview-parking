import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { DataSource, Repository } from 'typeorm';

import { Bill } from '~entity/bill.entity';
import { Building } from '~entity/building.entity';
import { Park } from '~entity/park.entity';
import { Slot, SlotType } from '~entity/slot.entity';
import { CheckInRequest } from '~request/bill/check-in.request';
import { CheckOutRequest } from '~request/bill/check-out.request';
import { createNotFoundException, createUnknownException } from '~util';

@Injectable()
export class BillService {
  private readonly logger = new Logger(BillService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Park) private readonly parkRepository: Repository<Park>,
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
    @InjectRepository(Slot) private readonly slotRepository: Repository<Slot>,
    @InjectRepository(Bill) private readonly billRepository: Repository<Bill>,
  ) {}

  private generateBillCode(slotId: number) {
    const pad = '00000000';
    return `${('00000000' + slotId).slice(-pad.length)}-${Date.now()}`;
  }

  async checkIn(slotId: number, details: CheckInRequest): Promise<Bill> {
    this.logger.log(`checking in slot id ${slotId}`);
    const slot = await this.slotRepository.findOneBy({ id: slotId });
    if (!slot) {
      throw createNotFoundException('slot', 'id', slotId);
    }
    if (slot.status === 'occupied') {
      throw new ConflictException('Slot occupied', {
        description: `slot with id ${slotId} is occupied`,
      });
    }
    if (slot.status === 'closed') {
      throw new ConflictException('Slot closed', {
        description: `slot with id ${slotId} is closed`,
      });
    }

    return this.dataSource.transaction(async (em) => {
      slot.status = 'occupied';
      await em.save(Slot, slot);
      const bill = await em.save(
        Bill,
        em.create(Bill, {
          slotId: slot.id,
          code: this.generateBillCode(slotId),
          checkInTime: new Date(),
          carPlateNumber: details.carPlateNumber,
          carPlateProvince: details.carPlateProvince,
        }),
      );
      const billWithSlot = await em.getRepository(Bill).findOne({
        where: { id: bill.id },
        relations: ['slot'],
      });
      if (!billWithSlot) {
        throw createUnknownException();
      }
      return billWithSlot;
    });
  }

  async checkInByPark(
    parkId: number,
    slotType: SlotType,
    details: CheckInRequest,
  ) {
    const park = await this.parkRepository.findOneBy({ id: parkId });
    if (!park) {
      throw createNotFoundException('park', 'id', parkId);
    }
    const slot = await this.slotRepository.findOneBy({
      status: 'vacant',
      type: slotType,
      building: { parkId },
    });
    if (!slot) {
      throw createUnknownException();
    }
    return this.checkIn(slot.id, details);
  }

  async checkInByBuilding(
    buildingId: number,
    slotType: SlotType,
    details: CheckInRequest,
  ) {
    const building = await this.buildingRepository.findOneBy({
      id: buildingId,
    });
    if (!building) {
      throw createNotFoundException('building', 'id', buildingId);
    }
    const slot = await this.slotRepository.findOneBy({
      status: 'vacant',
      type: slotType,
      buildingId,
    });
    if (!slot) {
      throw createUnknownException();
    }
    return this.checkIn(slot.id, details);
  }

  async checkout(billCode: string, details: CheckOutRequest): Promise<Bill> {
    this.logger.log(`checking-out bill ${billCode}`, { details });
    const bill = await this.billRepository.findOneBy({ code: billCode });
    if (!bill) {
      throw createNotFoundException('bill', 'code', billCode);
    }
    if (bill.checkOutTime) {
      throw new ConflictException('Bill checked-out', {
        description: `bill with code ${billCode} has already been checked-out`,
      });
    }
    const park = await this.parkRepository.findOneBy({
      buildings: {
        slots: {
          bills: { code: billCode },
        },
      },
    });
    if (!park) {
      throw createUnknownException();
    }
    const checkOutTime = new Date();
    const timeDiff = dayjs(checkOutTime).diff(bill.checkInTime, 'minutes');
    const amount =
      (timeDiff - park.fixedFirstPeriod > 0
        ? Math.ceil((timeDiff - park.fixedFirstPeriod) / 60) * park.hourlyCost
        : 0) +
      park.fixedFirstPeriodCost -
      details.discount;
    return this.dataSource.transaction(async (em) => {
      const updatedBill = await em.save(Bill, {
        ...bill,
        amount,
        checkOutTime,
        discount: details.discount,
      });
      await em
        .getRepository(Slot)
        .update({ id: bill.slotId }, { status: 'vacant' });
      return updatedBill;
    });
  }
}
