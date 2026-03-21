import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StaffRecord } from '../records/record.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'text', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'datetime', nullable: true })
  resetPasswordExpiresAt: Date | null;

  @OneToMany(() => StaffRecord, (record) => record.user)
  records: StaffRecord[];
}
