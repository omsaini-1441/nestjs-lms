import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Group } from './group.entity';

export enum GroupRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

@Entity()
@Unique(['user', 'group'])
export class GroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Group, (group) => group.members, {
    onDelete: 'CASCADE',
  })
  group: Group;

  @Column({
    type: 'enum',
    enum: GroupRole,
    default: GroupRole.MEMBER,
  })
  role: GroupRole;
}
