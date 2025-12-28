import { Injectable, Logger } from '@nestjs/common';
import { Player } from '../models/player.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PlayerService {
  private readonly logger = new Logger(PlayerService.name);
  private players: Map<string, Player> = new Map<string, Player>();

  createPlayer(playerName: string, isBot = false) {
    this.logger.log(`Creating player: ${playerName}, isBot: ${isBot}`);
    const id = uuidv4();
    const player = new Player(playerName, 2000, id, isBot);
    this.players.set(player.id, player);
    return player;
  }

  removePlayer(playerId: string) {
    this.logger.log(`Removing player: ${playerId}`);
    this.players.delete(playerId);
  }

  getPlayer(playerId: string) {
    return this.players.get(playerId);
  }
}
