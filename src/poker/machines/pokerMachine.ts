import { createMachine, interpret, send } from 'xstate';
import { Table } from '../models/table.model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from '../utils/types';
import { Logger } from '@nestjs/common';

export interface Ctx {
  table: Table;
  eventEmitter: EventEmitter2;
  logger: Logger;
}

const getBettingRound = (nextRoundTarget: string) => ({
  initial: 'startRound',
  states: {
    startRound: {
      always: [
        {
          cond: 'isRoundSkippable',
          target: nextRoundTarget,
        },
        {
          target: 'playerTurn',
          actions: ['checkIfAllIn', 'checkIfBotTurn'],
        },
      ],
    },
    playerTurn: {
      initial: 'deciding',
      states: {
        deciding: {
          on: {
            RAISE: {
              actions: ['raise', 'setLastPlayerToTalk'],
              target: 'evaluating',
            },
            CALL: {
              cond: 'isBetActive',
              actions: ['call'],
              target: 'evaluating',
            },
            FOLD: [
              {
                target: '#pokerGame.handResult',
                cond: 'isTwoPlayerLeft',
                actions: ['fold', 'handleWinWithouShowDown'],
              },
              {
                target: 'evaluating',
                actions: ['fold'],
              },
            ],
            CHECK: {
              actions: ['check'],
              target: 'evaluating',
            },
            BET: {
              actions: ['bet', 'setLastPlayerToTalk'],
              target: 'evaluating',
            },
          },
        },
        evaluating: {
          entry: send('CHECK_ROUND'),
          on: {
            CHECK_ROUND: [
              {
                cond: 'isLastPlayerToTalk',
                target: nextRoundTarget,
              },
              {
                target: 'deciding',
                actions: ['handleNextPlayer', 'checkIfAllIn', 'checkIfBotTurn'],
              },
            ],
          },
        },
      },
    },
  },
});

export const getPokerMachine: any = (
  table: Table,
  eventEmitter: EventEmitter2,
) => {
  const logger = new Logger(`PokerMachine-${table.id}`);

  return interpret(
    createMachine<Ctx>(
      {
        /** @xstate-layout N4IgpgJg5mDOIC5QAcD2BrMAnA4gQwFswBiAGQFEBBANXIH0AVSgIQoG0AGAXURVVgCWAFwGoAdrxAAPRAEYAnAHYArADoAzLPUAOWQBZFsgEzyO87QBoQATzkdFqxYu1HlHIxwBsuzzoC+flZomLiEJABSAPIAkgByjCzs3JJogiLikjIICrqqHLLK2nryykYGnp5WttlGAUEY2PhEqgIQADYknDxIIKnCohI9WQYOJfJGRurq5nrGilWIRp6KHKp66hOeJp7yngV1vQ2hzchYYABibajIqrBCeFhCAEqoAK5iEMRdKfz9GUOIbSeNQuXTFHZKZSKPQLBBLKZrZTqTx6dx6PTKLQHYKNMKqU4XK43ZBtPDWbAMV5YMT40nkrCUADG6TExCelGiAGVyN8en0WZlEJDVNoVNpdrIVHoTJYbIh1MVRuttF49Cr5MY9Nijk0wPizpdrrSyRSqTSSSaGcyBsQAMKUUikXl8NIDQUIYWiwoSqUy2EbWSyVSyYFTCreJGKdTakK6-WEo0W+mU6nG+lMlnEc6RUgAEWdh1d-1AwycqjGEymMzmsLKHDUyml+WmHG0Om0MdxJwNRLTptTSewGZt2bzbFk3Rdf0GJaFKhFYp9jb9coQmgKGlFkqMUaRU2UneOeoJhuJdP75vPVsztoAEuRbQBpAv8t0Aj3zr3iva+8z+-LyKonhmBwar5NCraHnGJ69oOWAppelrDuIxDMOQDAvr8Arvp6i4-suf6rsiHh5BiFSlJGii1IEhyxniMGJleCGqGAHwIV8yR8lhb6ztkTblqiuzAnoKLaMo-r6J4jgcNMGoYvI6KyFB9E9oxlrMaxEDseOk6FtO7pQrWsigaoyjeFWuiBko0Y0TiR7xqefbwWaqhiGAUhCAACleHG6a+xbSHIBirFCHhRqKHgav66hmXkpRlHs8jqE4krKc0ABmvZ3A8zxvB8vk-EWM6BXCO6qEsOzSuoXjzERarlvprY6FGCqyEUaV6planJi5cHIay7JcjynFTthvFTA4mgieq0yaBUMKrsYWhrKBMn1qBbUTB1qhdWe6m9Ve-V2g6TojXpY0lRNGiSTNSUhiisLjFJWyFAomJLOi1H1HRGWwUxB1IdaKGjvmZ3+cVWSBvOphvRisnGeJq7rEG3iuMohQbEUYkHrZOp4rtTnMX1QOsiDOmFfp75XVN3hmLN90LdUbarEUijAujigKaiX20V2nV-ftA6HSTdr3k+mFFe61M3XTd3zbCu55JV6KFJz7hKbjP3891F5OUdaEYWD3EBVk0vTbLc0PYt+6mV4+TlMoSU2d9fM7QLPWppp2lG5L75Q2oMMlHD8gavWCvrEBTjOMZ6LVRU20E3BGlsWaXwThTF1ZM4RgaJz2eo47GKwkCOchhie6ijsSwJ+7utuR53mWgVXG+7x2e50oLgFwpiPVMZhimcYAY5OYUzbUILnZY8LzvJ8EuU7xBSlOV+hJaBn1Y7Cyws5ZSxJVV4rjwDHuIemIuDdy8+Z3IFQ50sFWmGzMOM3ISJqMlZgRXJyxH0Lgun0OEW9pHRXx4iVe6d8tgVEfjse2sJNTaFMuMEuUIYqzC1JrV2E8-4nz1iLMmPsF4lVFLWNwOcgTAQ5tnZwihf4AOcjgwBmYybpxbkQyGt9ypQNgU-OBi0CjkMkuYFEMlkqeDoYTY+TCbR3gfM+Qh19sicPvtA+wsD9DwPrA4GSok2Zqk5klCRScpHXhtAbUBJsb5bC4Q-NRz94HAgcAYaqbU9hL1Spg+y2D6HJy0qnCxENFhuBZsUXQhhtBAnXpo4EQF0RiSMECaqKgjH-U9inakac-LG0CXCfuGgdyhklOsdE8C2p6GDHNHROgtHiM8XGbxkjUz1y8j5AJ7ojB5I2GzJERSFQv2yLNNYnMTAqCSo-Hmdk4xYAEAAN2wLce4088pzwUWArICSywhh3CJGSIki6rhDuQtUWh8gqPMNtaZcysCNPoUdC+w0smtxKjKBwHTQJFAqFRPY-S2pQg0MlEoxhUYKAubM+ZxjGGmJQsA06jz2GLHMK8mOHzlhLA0YtKEIVHZd3Ru4JKtSXb2UueC1Jtz8E5lBnCxRThazAiDCYTagYkQylBVcm5eDmEUvJmwxRLyV7vJEqi758CDDlOjrfH8rYSispJf-DlMixbyKpWshFop+VqkFV89FfcAV5BkpGcUGoUQyuuRCslmZzGrMsXCRF6qUVap+UoQC6J8joy0OjBJBLeZErBaa0lLF0msjaVTFwag85iiWM4dGPzmpAUDD4Ns5g0UmvZV7fxrDRoqrXOsO+KhCgogRrNeBbgpKf1DBEooW06l4mJX6uVzTG30mbpm61CoNjlTzUCWY9Yi2LUMGodEWx9DvQ2KUbasAAAWqAADuEAZ1BqtTkjw5TvDokfgqcYHB3D+nMqRGSZdHamHkAEGiYhUAQDgD8LWGcs0AFpap9yoqZMyIkrJtkbOibarQOg3tbeKUiiTDCyXML3RYOwpKzA6ZiIEpRNDbQYsgX9OTliATMktWDbiNikIxOWFD0G44bHg6pG4U9cqzyQ+6KMIU9hQcmJhowtL0bBnyOzQobyMGEugsRm5FH3xUQcGh2jyJAxYdXCYaqjhkoiZUL4e2RGEx7VwcTC64NKPzkEwI4TWgGNEQLeVEozVGz9o8ZxlSCnU2Bt44vOOQy1SYn3ejQoEkdCmVHVMBJyINjO29Vx8zZrXLuRaZaKz4DOGAcMGUVEQJZTVBipocs7gdwsYNTjUzv1rgheGLIWlQZpSJsbIXPYXga5GlIzPD4mWhQ6diysUyWwzBUTcCGUUJXFMXkqwgcUW8RLBkhMZDYeHUs+fxrXBh5qwGqb9sleBMUpJ5uKIpEYzhWsWb8dSDrnyGqeahEHaUoHOtInLGvMREppQTLxultrY2AsNyvB1pQK7DBgXrPJeBZRJovTMk7WWdCOtaBiQpTmEStBijVLCDGGgg46FKPq3QEiyvLL+7MKSgPzC6GSoUMHq4q6mQZaidcXgoQpP-kj5aqPgcY83gc7wwYUToymJXJ6xOlPCxU9k90kkgzk-R6DmLN9nCOE2Fuww+6sTVuaA0-zab1s8qzQocYIo9hbFmtVHc1W5CSgDsBesGoIm+GBMzuugXG3YA6xMEOcbxgvu2IYSoGKdj5IM1RYoBWvWTJrb6s3sCRQlBVMlHcPdHr1g0FsRSEWdDHvF3qWtCycrlYgGb6EQZxSFBkvxwPi17ZrF2JMZESa88prNYnlzKe-fp-2X3EwqwtAhiqSqKEHHhvNBj-55TE32fvh3ECH3qf-ecwr4sLdqxvAlCojJQ5ySo+qBb-66XxVJvjU0A4dU6wSi569CKpQ5YkuTBDEiCJ52tbT99eyhtd3ZettD3VqibZs5v3geKeluxVbFBDhrNLepJ0zrndO+fHe27q5riGDL5uDJRTAbAlCFAnp+BAA */
        id: 'pokerGame',
        initial: 'idle',
        context: {
          table,
          eventEmitter,
          logger,
        },
        on: {
          LEAVE_TABLE: {
            actions: 'removePlayer',
          },
          JOIN_TABLE: {
            actions: 'addPlayer',
          },
        },
        states: {
          idle: {
            entry: (ctx) => ctx.logger.log('Entering Idle state'),
            exit: (ctx) => ctx.logger.log('Exiting Idle state'),
            on: {
              JOIN_TABLE: [
                {
                  actions: ['addPlayer', 'startNewHand', 'setLastPlayerToTalk'],
                  target: 'preFlop',
                  cond: 'hasLeastOnePlayer',
                },
                {
                  actions: 'addPlayer',
                  target: 'idle',
                },
              ],
            },
            always: {
              actions: ['startNewHand', 'setLastPlayerToTalk'],
              cond: (ctx) => {
                ctx.logger.log('Evaluating idle always transition');
                return ctx.table.hasMoreThanOnePlayer;
              },
              target: 'preFlop',
            },
          },
          preFlop: {
            entry: (ctx) => ctx.logger.log('Entering Pre-Flop state'),
            ...getBettingRound('#pokerGame.flop'),
          },
          flop: {
            entry: (ctx) => {
              ctx.logger.log('Entering Flop state');
              ctx.table.handleFlop();
            },
            ...getBettingRound('#pokerGame.turn'),
          },
          turn: {
            entry: (ctx) => {
              ctx.logger.log('Entering Turn state');
              ctx.table.handleTurn();
            },
            ...getBettingRound('#pokerGame.river'),
          },
          river: {
            entry: (ctx) => {
              ctx.logger.log('Entering River state');
              ctx.table.handleRiver();
            },
            ...getBettingRound('#pokerGame.handResult'),
          },
          handResult: {
            entry: (ctx) => {
              ctx.logger.log('Entering Hand Result state');
              ctx.eventEmitter.emit(Events.SHOWDOWN, {
                tableId: ctx.table.id,
              });

              // Showdown logic
              if (ctx.table.players.filter((p) => !p.isFolded).length > 1) {
                ctx.logger.log('Triggering Showdown logic');
                ctx.table.handleShowDown();
                ctx.eventEmitter.emit(Events.ASK_FOR_CARDS, {
                  tableId: ctx.table.id,
                });
              }

              // Always move dealer and start next hand sequence
              ctx.table.handleNextDealer();
              ctx.eventEmitter.emit(Events.START_NEW_HAND, {
                tableId: ctx.table.id,
              });
            },
            exit: (ctx) => ctx.logger.log('Exiting Hand Result state'),
            on: {
              RESTART: [
                {
                  cond: 'hasMoreThanOnePlayer',
                  target: 'preFlop',
                  actions: ['startNewHand', 'setLastPlayerToTalk'],
                },
                {
                  target: 'idle',
                  actions: (ctx) =>
                    ctx.logger.log('RESTART, but not enough players => idle'),
                },
              ],
            },
          },
        },
      },
      {
        guards: {
          isBetActive: (ctx) => ctx.table.highestBet > 0,
          isBetNotActive: (ctx) => ctx.table.highestBet === 0,
          hasMoreThanOnePlayer: (ctx) => ctx.table.hasMoreThanOnePlayer,
          hasLeastOnePlayer: (ctx) => ctx.table.hasLeastOnePlayer,
          isLastPlayerToTalk: (ctx) => ctx.table.isLastPlayerToTalk,
          isRoundSkippable: (ctx) => {
            if (ctx.table.isHandOver) return false;
            const players = ctx.table.players;
            const act = players.filter(
              (p) => !p.isFolded && !p.isAllIn && p.chips > 0,
            );

            const areBetsEqual = !players.some(
              (p) =>
                !p.isFolded && !p.isAllIn && p.bet !== ctx.table.highestBet,
            );

            const bool = act.length <= 1 && areBetsEqual;
            if (bool) {
              ctx.logger.debug(
                `isRoundSkippable: ${bool}. Active players count: ${act.length}`,
              );
            }
            return bool;
          },
          isNotLastPlayerToTalk: (ctx) => !ctx.table.isLastPlayerToTalk,
          isTwoPlayerLeft: (ctx) =>
            ctx.table.players.filter((p) => !p.isFolded).length === 2,
        },
        actions: {
          addPlayer: (ctx, evt) => {
            ctx.logger.log(`Adding player ${evt.player.name}`);
            ctx.table.addPlayer(evt.player);
          },
          removePlayer: (ctx, evt) => {
            ctx.logger.log(`Removing player ${evt.player.name}`);
            ctx.table.removePlayer(evt.player);
          },
          check: (ctx) => {
            ctx.logger.log(`Player ${ctx.table.currentPlayer.name} checks`);
            ctx.table.check();
          },
          fold: (ctx) => {
            ctx.logger.log(`Player ${ctx.table.currentPlayer.name} folds`);
            ctx.table.fold();
          },
          bet: (ctx, evt) => {
            ctx.logger.log(
              `Player ${ctx.table.currentPlayer.name} bets ${evt.amount}`,
            );
            ctx.table.bet(evt.amount);
          },
          raise: (ctx, evt) => {
            ctx.logger.log(
              `Player ${ctx.table.currentPlayer.name} raises ${evt.amount}`,
            );
            ctx.table.raise(evt.amount);
          },
          call: (ctx) => {
            ctx.logger.log(`Player ${ctx.table.currentPlayer.name} calls`);
            ctx.table.call();
          },
          startNewHand: (ctx) => {
            ctx.logger.log('Starting new hand');
            ctx.table.startNewHand();
          },
          setLastPlayerToTalk: (ctx) => ctx.table.setLastPlayerToTalk(),
          handleWinWithouShowDown: (ctx) => {
            ctx.logger.log('Handling Win Without Showdown');
            ctx.table.handleWinWithoutShowDown();
          },
          handleNextPlayer: (ctx) => {
            ctx.table.handleNextPlayer();
            ctx.logger.log(`Next player is ${ctx.table.currentPlayer.name}`);
          },
          handleNextDealer: (ctx) => {
            ctx.table.handleNextDealer();
          },
          checkIfAllIn: (ctx) => {
            ctx.logger.log('Broadcasting CHECK_IF_ALL_IN event');
            ctx.eventEmitter.emit(Events.CHECK_IF_ALL_IN, {
              tableId: ctx.table.id,
            });
          },
          checkIfBotTurn: (ctx) => {
            ctx.logger.log('Broadcasting CHECK_IF_BOT_TURN event');
            if (ctx.table.currentPlayer.isBot) {
              ctx.logger.log('Bot turn');
              ctx.eventEmitter.emit(Events.HANDLE_BOT_TURN, {
                table: ctx.table,
              });
            }
          },
        },
      },
    ),
  ).start();
};
