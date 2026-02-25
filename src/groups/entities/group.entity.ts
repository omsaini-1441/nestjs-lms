import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { GroupMember } from './group-member.entity';

export enum GroupVisibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: GroupVisibility,
    default: GroupVisibility.PRIVATE,
  })
  visibility: GroupVisibility;

  @Column({ nullable: true })
  maxMembers: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  createdBy: User;

  @OneToMany(() => GroupMember, (member) => member.group)
  members: GroupMember[];
}
