import { Entity, Column, PrimaryColumn } from 'typeorm';

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

  @PrimaryColumn()
  bet_id: number;
}
