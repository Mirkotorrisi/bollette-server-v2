import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bolletta')
export class Ticket {
  @PrimaryGeneratedColumn()
  ticket_id: number;

  @Column()
  import: number;

  @Column()
  max_win: number;

  @Column()
  status: string;

  @Column()
  user_id: number;

  @Column()
  paid: boolean;

  @Column()
  insert_time: number;
}
