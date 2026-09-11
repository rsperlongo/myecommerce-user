import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_profiles')
export class UserProfileTypeormEntity {
  @PrimaryColumn()
  email!: string;

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

  @Column()
  married!: boolean;

  @Column()
  churchMember!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
