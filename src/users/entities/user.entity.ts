import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';



@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true})
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({default: false})
  isEmailVerified: boolean;

  @Column()
  password: string;

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  /*
  Entities should be "dumb"
  Business logic (hashing) belongs in services
  Makes testing easier
  Makes password updates safer
  */
 
  // @BeforeInsert()
  // async hashPassword() {
  //   this.password = await bcrypt.hash(this.password, 10);
  // }
}
