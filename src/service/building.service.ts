import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Building } from '~entity/building.entity';
import { Park } from '~entity/park.entity';
import { Slot, SlotStatus, SlotType } from '~entity/slot.entity';
import { CreateBuildingRequest } from '~request/building/create-building.request';
import { createNotFoundException } from '~util';

@Injectable()
export class BuildingService {
  private readonly logger = new Logger(BuildingService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Park)
    private readonly parkRepository: Repository<Park>,
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
  ) {}

  async create(parkId: number, details: CreateBuildingRequest) {
    this.logger.log('creating a new building', { details });
    const park = await this.parkRepository.findOneBy({ id: parkId });
    if (!park) {
      throw createNotFoundException('park', 'id', parkId);
    }
    return this.buildingRepository.save({
      name: details.name,
      description: details.description,
      capacity: details.slots?.length ?? 0,
      slots: details.slots?.map((slot) => ({
        label: slot.label,
        type: slot.type ?? ('car' as SlotType),
        floor: slot.floor,
        status: 'vacant' as SlotStatus,
      })),
    });
  }

  async delete(buildingId: number): Promise<Building> {
    this.logger.log('deleting building', { buildingId });
    const building = await this.buildingRepository.findOne({
      where: { id: buildingId },
      relations: ['slots'],
    });
    if (!building) {
      throw createNotFoundException('building', 'id', buildingId);
    }
    await this.dataSource.transaction(async (em) => {
      await em.getRepository(Slot).delete({ buildingId });
      await em.getRepository(Building).delete({ id: buildingId });
    });

    return building;
  }
}
