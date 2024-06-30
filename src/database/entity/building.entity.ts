import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  VirtualColumn,
} from 'typeorm';
import { Paranoid } from './util/paranoid';
import { Park } from './park.entity';
import { Slot } from './slot.entity';

@Entity({ name: 'buildings' })
export class Building extends Paranoid {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_building' })
  id: number;

  @Index('slot_fk_park_id_index')
  @Column({ name: 'park_id', type: 'int' })
  parkId: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => Slot, (slot) => slot.building, { cascade: ['insert'] })
  slots?: Slot[];

  @ManyToOne(() => Park, (park) => park.buildings, { cascade: false })
  @JoinColumn({
    name: 'park_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_building_park',
  })
  park?: Park;

  @VirtualColumn('int', {
    query: (alias) => `SELECT COUNT(*) FROM "slots" s
    WHERE s.building_id = ${alias}.id`,
  })
  capacity: number = 0;

  @VirtualColumn('int', {
    query: (alias) => `SELECT COUNT(*) FROM "slots" s
    WHERE s.building_id = ${alias}.id AND s.status = 'vacant'`,
  })
  vacancy: number = 0;
}
