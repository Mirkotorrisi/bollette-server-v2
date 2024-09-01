import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('bet')
export class Bet {
  @Column()
  ticket_id: number;

  @Column()
  team_1: string;

  @Column()
  team_2: string;

  @Column()
  result: string;

  @Column()
  odd: string;

  @Column()
  commence_time: number;

  @Column()
  matchId: string;

  @Column({
    type: 'enum',
    enum: ['ongoing', 'won', 'lost'],
    default: 'ongoing',
  })
  status: 'ongoing' | 'won' | 'lost';

  @PrimaryColumn()
  bet_id: number;
}
