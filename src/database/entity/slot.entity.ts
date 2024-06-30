import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Paranoid } from './util/paranoid';
import { Bill } from './bill.entity';
import { Building } from './building.entity';

export type SlotStatus = 'vacant' | 'occupied' | 'closed';
export type SlotType = 'car' | 'motorcycle' | 'bicycle' | 'large' | 'xlarge';

@Entity({ name: 'slots' })
export class Slot extends Paranoid {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_slot' })
  id: number;

  @Index('slot_fk_building_id_index')
  @Column({ name: 'building_id', type: 'int' })
  buildingId: number;

  @Column({ type: 'varchar', length: 50 })
  label: string;

  @Column({ type: 'varchar', length: 20, default: '1' })
  floor: string;

  @Column({
    type: 'enum',
    enum: ['car', 'motorcycle', 'bicycle', 'large', 'xlarge'],
    default: 'car',
  })
  type: SlotType = 'car';

  @Column({
    type: 'enum',
    enum: ['vacant', 'occupied', 'closed'],
    default: 'vacant',
  })
  status: SlotStatus = 'vacant';

  @ManyToOne(() => Building, (building) => building.slots, { cascade: false })
  @JoinColumn({
    name: 'building_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_slot_building',
  })
  building?: Building;

  @OneToMany(() => Bill, (bill) => bill.slot, { cascade: false })
  bills?: Bill[];
}
