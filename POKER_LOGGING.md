# Poker Logging System

This document describes the logging system implemented for the poker game section.

## Overview

The poker logging system provides real-time game event logs that are displayed to users on the frontend. These logs are sent through the same socket gateway that sends table logic updates.

## Features

The logging system captures the following events:

### Player Actions
- **Bet**: "Player X bets $50"
- **Call**: "Player X calls $50"
- **Raise**: "Player X raises to $150"
- **Check**: "Player X checks"
- **Fold**: "Player X folds"

### Community Cards
- **Flop**: "Flop: 3D  4D  KH"
- **Turn**: "Turn: AS"
- **River**: "River: QH"

### Game Results
- **Showdown Win**: "Player X wins $100.00 with a pair of Aces"
- **Win without Showdown**: "Player X wins $100.00 (all opponents folded)"

### Player Management
- **Join**: "Player X joined the table"
- **Leave**: "Player X left the table"

## Implementation

### Architecture

1. **Table Model (`table.model.ts`)**: 
   - Maintains a `logs` array to store log messages
   - Provides `addLog()` method to add new log messages
   - Provides `clearLogs()` method to reset logs when a new hand starts
   - All game actions (bet, call, raise, fold, check) automatically add logs

2. **Table Service (`table.service.ts`)**: 
   - Provides `getTableLogs()` method to retrieve logs for a specific table

3. **Poker Gateway (`poker.gateway.ts`)**: 
   - Emits logs to connected clients via the `GAME_LOG` action
   - Calls `emitLogs()` after each game action to send logs to the frontend
   - Logs are sent to all players at the same table via socket rooms

4. **Types (`types.ts`)**: 
   - Added `GAME_LOG` action to the `Actions` enum

5. **Hand Utils (`handsUtils.ts`)**: 
   - Added `formatCardForDisplay()` and `formatCardsForDisplay()` functions
   - Formats cards in a user-friendly format (e.g., "3D" for Three of Diamonds)

## Socket Events

### Receiving Logs (Frontend)

To receive game logs on the frontend, listen to the `gameLog` event:

```typescript
socket.on('gameLog', (logs: string[]) => {
  // logs is an array of log messages
  logs.forEach(log => {
    console.log(log);
    // Display log in UI
  });
});
```

## Example Usage

When a player makes an action, the following sequence occurs:

1. Player calls `handleBet()` via socket
2. Table service processes the bet
3. Table model's `bet()` method adds a log: "Player X bets $50"
4. Gateway emits the updated table state
5. Gateway calls `emitLogs()` which sends all accumulated logs via `GAME_LOG` event
6. Frontend receives logs and displays them to all players at the table

## Log Lifecycle

- Logs are **accumulated** during a hand
- Logs are **cleared** when a new hand starts
- Logs are **sent** after each player action
- Logs are **room-specific** (only sent to players at the same table)

## Testing

The logging system is tested in `__tests__/logging.spec.ts`, which includes tests for:
- Player action logging
- Community card logging
- Showdown results
- Win without showdown
- Log clearing on new hand
- Bet and raise amount formatting
