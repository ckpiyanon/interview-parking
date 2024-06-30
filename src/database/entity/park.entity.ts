import {
  Column,
  Entity,
  OneToMany,
  Point,
  PrimaryGeneratedColumn,
  VirtualColumn,
} from 'typeorm';

import { Building } from './building.entity';
import { Paranoid } from './util/paranoid';
import { numberTransformer } from './util/transformer';

@Entity({ name: 'parks' })
export class Park extends Paranoid {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_park' })
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'geometry',
    srid: 4326,
    spatialFeatureType: 'Point',
  })
  location: Point;

  @Column({ name: 'cost_description', type: 'text', nullable: true })
  costDescription?: string;

  /** in minutes */
  @Column({ name: 'fixed_first_period', type: 'int' })
  fixedFirstPeriod: number = 0;

  /** first m minutes costs n */
  @Column({
    name: 'fixed_first_period_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    // pg tends to return decimal as a string, explicitly cast to number
    transformer: numberTransformer,
  })
  fixedFirstPeriodCost: number = 0;

  @Column({
    name: 'hourly_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    // pg tends to return decimal as a string, explicitly cast to number
    transformer: numberTransformer,
  })
  hourlyCost: number = 0;

  @OneToMany(() => Building, (building) => building.park, {
    cascade: ['insert'],
  })
  buildings?: Building[];

  @VirtualColumn('int', {
    query: (alias) => `SELECT COUNT(*) FROM "slots" s
    INNER JOIN "buildings" b ON s.building_id = b.id
    WHERE b.park_id = ${alias}.id`,
  })
  // @ViewColumn()
  capacity: number;

  @VirtualColumn('int', {
    query: (alias) => `SELECT COUNT(*) FROM "slots" s
    INNER JOIN "buildings" b ON s.building_id = b.id
    WHERE b.park_id = ${alias}.id AND s.status = 'vacant'`,
  })
  // @ViewColumn()
  vacancy: number;
}
