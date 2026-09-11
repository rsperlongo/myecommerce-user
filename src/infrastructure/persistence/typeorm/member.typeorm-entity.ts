import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('members')
@Index('UQ_members_email', ['email'], {
  unique: true,
  where: '"email" IS NOT NULL',
})
export class MemberTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true })
  email!: string | null;

  @Column()
  name!: string;

  @Column()
  phone!: string;

  @Column()
  address!: string;

  @Column()
  city!: string;

  @Column({ length: 2 })
  uf!: string;

  @Column({ default: false })
  married!: boolean;

  @Column({ default: true })
  churchMember!: boolean;

  @Column({ type: 'date' })
  memberSince!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
