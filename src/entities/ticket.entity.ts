import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bolletta')
export class Ticket {
  @PrimaryGeneratedColumn()
  ticket_id: number;

  @Column()
  import: number;

  @Column()
  max_win: number;

  @Column({
    type: 'enum',
    enum: ['ongoing', 'won', 'lost'],
    default: 'ongoing',
  })
  status: 'ongoing' | 'won' | 'lost';

  @Column()
  user_id: number;

  @Column()
  paid: boolean;

  @Column()
  insert_time: number;
}
