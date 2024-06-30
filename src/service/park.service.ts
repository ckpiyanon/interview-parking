import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository, SelectQueryBuilder } from 'typeorm';

import { Building } from '~entity/building.entity';
import { Park } from '~entity/park.entity';
import { Slot, SlotStatus, SlotType } from '~entity/slot.entity';
import { CreateParkRequest } from '~request/park/create-park.request';
import { createNotFoundException, someNil } from '~util';

type ParkQueryBuilderCallback = (
  queryBuilder: SelectQueryBuilder<Park>,
) => void | Promise<void> | any;

@Injectable()
export class ParkService {
  private readonly logger = new Logger(ParkService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Park)
    private readonly parkRepository: Repository<Park>,
  ) {}

  async create(details: CreateParkRequest): Promise<Park> {
    this.logger.log('creating a new park', { details });
    return this.parkRepository.save({
      name: details.name,
      description: details.description,
      location: {
        type: 'Point',
        coordinates: [details.location.longitude, details.location.latitude],
      },
      costDescription: details.costDescription,
      fixedFirstPeriod: details.fixedFirstPeriod,
      fixedFirstPeriodCost: details.fixedFirstPeriodCost,
      hourlyCost: details.hourlyCost,
      buildings: details.buildings?.map((building) => ({
        name: building.name,
        description: building.description,
        capacity: building.slots?.length ?? 0,
        slots: building.slots?.map((slot) => ({
          label: slot.label,
          type: slot.type ?? ('car' as SlotType),
          floor: slot.floor,
          status: 'vacant' as SlotStatus,
        })),
      })),
    });
  }

  private async query(
    queryType: 'one',
    callback?: ParkQueryBuilderCallback,
  ): Promise<Park>;
  private async query(
    queryType?: 'many',
    callback?: ParkQueryBuilderCallback,
  ): Promise<Park[]>;
  private async query(
    queryType: 'one' | 'many' = 'many',
    callback?: ParkQueryBuilderCallback,
  ) {
    const qb = this.parkRepository
      .createQueryBuilder('parks')
      .innerJoinAndMapMany(
        'parks.buildings',
        'buildings',
        'buildings',
        'parks.id = buildings.park_id',
      )
      .innerJoin(
        'buildings.slots',
        'slots',
        "buildings.id = slots.building_id AND slots.status != 'closed'",
      )
      .loadRelationCountAndMap('buildings.capacity', 'buildings.slots')
      .loadRelationCountAndMap(
        'buildings.vacancy',
        'buildings.slots',
        'slots',
        (qb) => qb.where("slots.status = 'vacant'"),
      );
    if (callback) {
      await callback(qb);
    }

    const calculateParkCap = ({ buildings, ...park }: Park): Park => ({
      ...park,
      capacity: Array.isArray(buildings)
        ? buildings?.reduce((sum, { capacity }) => sum + capacity, 0)
        : 0,
      vacancy: Array.isArray(buildings)
        ? buildings?.reduce((sum, { vacancy }) => sum + vacancy, 0)
        : 0,
    });

    if (queryType === 'many')
      return qb.getMany().then((park) => park.map(calculateParkCap));
    return qb.getOne().then(calculateParkCap);
  }

  async get(parkId: number): Promise<Park> {
    this.logger.log('getting park', { parkId });
    const park = await this.query('one', (qb) =>
      qb.andWhere('parks.id = :parkId', { parkId }),
    );
    if (!park) {
      throw createNotFoundException('park', 'id', parkId);
    }
    return park;
  }

  async find({
    latitude,
    longitude,
    distance,
    onlyVacant,
  }: {
    latitude?: number;
    longitude?: number;
    distance: number;
    onlyVacant: boolean;
  }): Promise<Park[]> {
    this.logger.log('listing parks', {
      latitude,
      longitude,
      distance,
      onlyVacant,
    });

    const parks = await this.query('many', (qb) => {
      if (!someNil(latitude, longitude)) {
        qb.andWhere(`ST_DWITHIN(
          ST_TRANSFORM(parks.location, 3857),
          ST_TRANSFORM('SRID=4326;POINT(${longitude} ${latitude})'::GEOMETRY, 3857),
          ${distance * 1000}
        )`);
      }
    });
    return onlyVacant ? parks.filter(({ vacancy }) => vacancy > 0) : parks;
  }

  async delete(parkId: number): Promise<Park> {
    this.logger.log('deleting park', { parkId });
    const park = await this.parkRepository.findOne({
      where: { id: parkId },
      relations: ['buildings', 'buildings.slots'],
    });
    if (!park) {
      throw createNotFoundException('park', 'id', parkId);
    }

    await this.dataSource.transaction(async (em) => {
      const buildingIds = await em
        .getRepository(Building)
        .findBy({ parkId })
        .then((buildings) => buildings.map(({ id }) => id));
      await em.getRepository(Slot).delete({ buildingId: In(buildingIds) });
      await em.getRepository(Building).delete({ parkId });
      await em.getRepository(Park).delete({ id: parkId });
    });

    return park;
  }
}
