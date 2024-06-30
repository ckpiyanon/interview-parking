import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Slot } from './slot.entity';
import { Paranoid } from './util/paranoid';
import { numberTransformer } from './util/transformer';

@Entity({ name: 'bills' })
export class Bill extends Paranoid {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_bill' })
  id: number;

  @Index('bill_fk_slot_id_index')
  @Column({ name: 'slot_id', type: 'int' })
  slotId: number;

  @Index('bill_code_index', { unique: true })
  @Column({ type: 'varchar', length: '50' })
  code: string;

  @Column({
    name: 'check_in_time',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP::TIMESTAMPTZ',
  })
  checkInTime: Date;

  @Column({ name: 'check_out_time', type: 'timestamptz', nullable: true })
  checkOutTime?: Date;

  @Column({ name: 'car_plate_number', type: 'varchar', length: 20 })
  carPlateNumber: string;

  @Column({ name: 'car_plate_province', type: 'varchar', length: 50 })
  carPlateProvince: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    // pg tends to return decimal as a string, explicitly cast to number
    transformer: numberTransformer,
  })
  amount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    // pg tends to return decimal as a string, explicitly cast to number
    transformer: numberTransformer,
    default: 0,
  })
  discount: number = 0;

  @ManyToOne(() => Slot, (slot) => slot.bills, { cascade: false })
  @JoinColumn({
    name: 'slot_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_bill_slot',
  })
  slot?: Slot;
}
