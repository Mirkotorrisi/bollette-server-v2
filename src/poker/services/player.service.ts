import { Injectable } from '@nestjs/common';
import { Player } from '../models/player.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PlayerService {
  private players: Map<string, Player> = new Map<string, Player>();

  createPlayer(playerName: string) {
    const id = uuidv4();
    const player = new Player(playerName, 2000, id);
    this.players.set(player.id, player);
    return player;
  }

  removePlayer(playerId: string) {
    this.players.delete(playerId);
  }

  getPlayer(playerId: string) {
    return this.players.get(playerId);
  }
}
