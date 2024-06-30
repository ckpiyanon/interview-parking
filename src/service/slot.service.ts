import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Building } from '~entity/building.entity';
import { Slot, SlotStatus } from '~entity/slot.entity';
import { CreateSlotRequest } from '~request/slot/create-slot.request';
import { createNotFoundException } from '~util';

@Injectable()
export class SlotService {
  private readonly logger = new Logger(SlotService.name);

  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
    @InjectRepository(Slot)
    private readonly slotRepository: Repository<Slot>,
  ) {}

  async create(
    buildingId: number,
    details: CreateSlotRequest[],
  ): Promise<Slot[]> {
    this.logger.log('creating new slot(s)', { details });
    return this.slotRepository.save(
      details.map((slot) => ({
        buildingId,
        label: slot.label,
        floor: slot.floor,
        type: slot.type,
        status: 'vacant',
      })),
    );
  }

  private async getBeforeUpdate(slotId: number): Promise<Slot> {
    const slot = await this.slotRepository.findOneBy({ id: slotId });
    if (!slot) {
      throw createNotFoundException('slot', 'id', slotId);
    }
    return slot;
  }

  private async updateStatus(slotId: number, status: SlotStatus) {
    this.logger.log(`updating slot status to '${status}'`, { slotId });
    const slot = await this.getBeforeUpdate(slotId);
    return this.slotRepository.save({
      ...slot,
      status,
    });
  }

  async open(slotId: number): Promise<Slot> {
    return this.updateStatus(slotId, 'vacant');
  }

  async close(slotId: number): Promise<Slot> {
    return this.updateStatus(slotId, 'closed');
  }

  async delete(slotId: number): Promise<Slot> {
    this.logger.log('deleting slot', { slotId });
    const slot = await this.getBeforeUpdate(slotId);
    this.slotRepository.delete({ id: slotId });
    return slot;
  }
}
