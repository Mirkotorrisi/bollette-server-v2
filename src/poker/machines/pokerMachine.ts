import { createMachine, interpret } from 'xstate';
import { Table } from '../models/table.model';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface Ctx {
  table: Table;
  eventEmitter: EventEmitter2;
}

const playerAction = {
  on: {
    RAISE: {
      cond: 'isBetActive',
      actions: ['setLastPlayerToTalk', 'raise'],
      target: 'nextPlayer',
    },
    CALL: {
      cond: 'isBetActive',
      actions: ['setLastPlayerToTalk', 'call'],
      target: 'endTurn',
    },
    FOLD: [
      {
        target: '#pokerGame.idle',
        cond: 'isTwoPlayerLeft',
        actions: ['fold', 'handleWinWithouShowDown', 'handleNextDealer'],
      },
      {
        target: 'endTurn',
        actions: ['setLastPlayerToTalk', 'fold'],
      },
    ],
    CHECK: {
      actions: ['setLastPlayerToTalk', 'check'],
      target: 'endTurn',
    },
    BET: {
      actions: ['setLastPlayerToTalk', 'bet'],
      target: 'nextPlayer',
    },
  },
};

const nextPlayer = {
  always: {
    target: 'playerAction',
    actions: ['handleNextPlayer', 'checkIfAllIn'],
  },
};

export const getPokerMachine: any = (
  table: Table,
  eventEmitter: EventEmitter2,
) =>
  interpret(
    createMachine<Ctx>(
      {
        /** @xstate-layout N4IgpgJg5mDOIC5QAcD2BrMAnA4gQwFswBiAGQFEBBANXIH0AVSgIQoG0AGAXURVVgCWAFwGoAdrxAAPRAEYAnAHYArADoAzLPUAOWQBZFsgEzyO87QBoQATzkdFqxYu1HlHIxwBsuzzoC+flZomLiEJABSAPIAkgByjCzs3JJogiLikjIICrqqHLLK2nryykYGnp5WttlGAUEY2PhEqgIQADYknDxIIKnCohI9WQYOJfJGRurq5nrGilWIRp6KHKp66hOeJp7yngV1vQ2hzchYYABibajIqrBCeFhCAEqoAK5iEMRdKfz9GUOIbSeNQuXTFHZKZSKPQLBBLKZrZTqTx6dx6PTKLQHYKNMKqU4XK43ZBtPDWbAMV5YMT40nkrCUADG6TExCelGiAGVyN8en0WZlEJDVNoVNpdrIVHoTJYbIh1MVRuttF49Cr5MY9Nijk0wPizpdrrSyRSqTSSSaGcyBsQAMKUUikXl8NIDQUIYWiwoSqUy2EbWSyVSyYFTCreJGKdTakK6-WEo0W+mU6nG+lMlnEc6RUgAEWdh1d-1AwycqjGEymMzmsLKHDUyml+WmHG0Om0MdxJwNRLTptTSewGZt2bzbFk3Rdf0GJaFKhFYp9jb9coQmgKGlFkqMUaRU2UneOeoJhuJdP75vPVsztoAEuRbQBpAv8t0Aj3zr3iva+8z+-LyKonhmBwar5NCraHnGJ69oOWAppelrDuIxDMOQDAvr8Arvp6i4-suf6rsiHh5BiFSlJGii1IEhyxniMGJleCGqGAHwIV8yR8lhb6ztkTblqiuzAnoKLaMo-r6J4jgcNMGoYvI6KyFB9E9oxlrMaxEDseOk6FtO7pQrWsigaoyjeFWuiBko0Y0TiR7xqefbwWaqhiGAUhCAACleHG6a+xbSHIBirFCHhRqKHgav66hmXkpRlHs8jqE4krKc0ABmvZ3A8zxvB8vk-EWM6BXCO6qEsOzSuoXjzERarlvorY6FGCqyEUaV6planJi5cHIay7JcjynFTthvFTA4mgieq0yaBUMKrsYWhrKBMn1qBbUTB1qhdWe6m9Ve-V2g6TojXpY0lRNGiSTNSUhiisLjFJWyFAomJLOi1H1HRGWwUxB1IdaKGjvmZ3+cVWSBvOphvRisnGeJq7rEG3iuMohQbEUYkHrZOp4rtTnMX1QOsiDOmFfp75XVN3hmLN90LdUbarEUijAujigKaiX20V2nV-ftA6HSTdr3k+mFFe61M3XTd3zbCu55JV6KFJz7hKbjP3891F5OUdaEYWD3EBVk0vTbLc0PYt+6mV4+TlMoSU2d9fM7QLPWppp2lG5L75Q2oMMlHD8gavWCvrEBTjOMZ6LVRU20E3BGlsWaXwThTF1ZM4RgaJz2eo47GKwkCOchhie6ijsSwJ+7utuR53mWgVXG+7x2e50oLgFwpiPVMZhimcYAY5OYUzbUILnZY8LzvJ8EuU7xBSlOV+hJaBn1Y7Cyws5ZSxJVV4rjwDHuIemIuDdy8+Z3IFQ50sFWmGzMOM3ISJqMlZgRXJyxH0Lgun0OEW9pHRXx4iVe6d8tgVEfjse2sJNTaFMuMEuUIYqzC1JrV2E8-4nz1iLMmPsF4lVFLWNwOcgTAQ5tnZwihf4AOcjgwBmYybpxbkQyGt9ypQNgU-OBi0CjkMkuYFEMlkqeDoYTY+TCbR3gfM+Qh19sicPvtA+wsD9DwPrA4GSok2Zqk5klCRScpHXhtAbUBJsb5bC4Q-NRz94HAgcAYaqbU9hL1Spg+y2D6HJy0qnCxENFhuBZsUXQhhtBAnXpo4EQF0RiSMECaqKgjH-U9inakac-LG0CXCfuGgdyhklOsdE8C2p6GDHNHROgtHiM8XGbxkjUz1y8j5AJ7ojB5I2GzJERSFQv2yLNNYnMTAqCSo-Hmdk4xYAEAAN2wLce4088pzwUWArICSywhh3CJGSIki6rhDuQtUWh8gqPMNtaZcysCNPoUdC+w0smtxKjKBwHTQJFAqFRPY-S2pQg0MlEoxhUYKAubM+ZxjGGmJQsA06jz2GLHMK8mOHzlhLA0YtKEIVHZd3Ru4JKtSXb2UueC1Jtz8E5lBnCxRThazAiDCYTagYkQylBVcm5eDmEUvJmwxRLyV7vJEqi758CDDlOjrfH8rYSispJf-DlMixbyKpWshFop+VqkFV89FfcAV5BkpGcUGoUQyuuRCslmZzGrMsXCRF6qUVap+UoQC6J8joy0OjBJBLeZErBaa0lLF0msjaVTFwag85iiWM4dGPzmpAUDD4Ns5g0UmvZV7fxrDRoqrXOsO+KhCgogRrNeBbgpKf1DBEooW06l4mJX6uVzTG70mbpm61CoNjlTzUCWY9Yi2LUMGodEWx9DvQ2KUbasAAAWqAADuEAZ1BqtTkjw5TvDokfgqcYHB3D+nMqRGSZdHamHkAEGiYhUAQDgD8LWGcs0AFpap9yoqZMyIkrJtkbOibarQOg3tbeKUiiTDCyXML3RYOwpKzA6ZiIEpRNDbQYsgX9OTliATMktWDbiNikIxOWFD0G44bHg6pG4U9cqzyQ+6KMIU9hQcmJhowtL0bBnyOzQobyMGEugsRm5FH3xUQcGh2jyJAxYdXCYaqjhkoiZUL4e2RGEx7VwcTC64NKPzkEwI4TWgGNEQLeVEozVGz9o8ZxlSCnU2Bt44vOOQy1SYn3ejQoEkdCmVHVMBJyINjO29Vx8zZrXLuRaZaKz4DOGAcMGUVEQJZTVBipocs7gdwsYNTjUzv1rgheGLIWlQZpSJsbIXPYXga5GlIzPD4mWhQ6diysUyWwzBUTcCGUUJXFMXkqwgcUW8RLBkhMZDYeHUs+fxrXBh5qwGqb9sleBMUpJ5uKIpEYzhWsWb8dSDrnyGqeahEHaUoHOtInLGvMREppQTLxultrY2AsNyvB1pQK7DBgXrPJeBZRJovTMk7WWdCOtaBiQpTmEStBijVLCDGGgg46FKPq3QEiyvLL+7MKSgPzC6GSoUMHq4q6mQZaidcXgoQpP-kj5aqPgcY83gc7wwYUToymJXJ6xOlPCxU9k90kkgzk-R6DmLN9nCOE2Fuww+6sTVuaA0-zab1s8qzQocYIo9hbFmtVHc1W5CSgDsBesGoIm+GBMzuugXG3YA6xMEOcbxgvu2IYSoGKdj5IM1RYoBWvWTJrb6s3sCRQlBVMlHcPdHr1g0FsRSEWdDHvF3qWtCycrlYgGb6EQZxSFBkvxwPi17ZrF2JMZESa88prNYnlzKe-fp-2X3EwqwtAhiqSqKEHHhvNBj-55TE32fvh3ECH3qf-ecwr4sLdqxvAlCojJQ5ySo+qBb-66XxVJvjU0A4dU6wSi569CKpQ5YkuTBDEiCJ52tbT99eyhtd3ZettD3VqibZs5v3geKeluxVbFBDhrNLepJ0zrndO+fHe27q5riGDL5uDJRTAbAlCFAnp+BAA */
        id: 'pokerGame',
        initial: 'idle',
        context: {
          table,
          eventEmitter,
        },
        on: {
          LEAVE_TABLE: {
            actions: 'removePlayer',
          },
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
        states: {
          idle: {
            always: {
              actions: ['startNewHand', 'setLastPlayerToTalk'],
              cond: 'hasMoreThanOnePlayer',
              target: 'preFlop',
            },
          },
          preFlop: {
            initial: 'startRound',
            states: {
              startRound: {
                always: {
                  actions: ['handlePreflop', 'checkIfAllIn'],
                  target: 'playerTurn',
                },
              },
              playerTurn: {
                initial: 'playerAction',
                states: {
                  playerAction,
                  endTurn: {
                    always: [
                      {
                        cond: 'isNotLastPlayerToTalk',
                        target: 'nextPlayer',
                      },
                      {
                        cond: 'isLastPlayerToTalk',
                        target: `#pokerGame.flop`,
                      },
                    ],
                  },
                  nextPlayer,
                },
              },
            },
          },
          flop: {
            initial: 'startRound',
            states: {
              startRound: {
                always: {
                  actions: ['handleFlop', 'checkIfAllIn'],
                  target: 'playerTurn',
                },
              },
              playerTurn: {
                initial: 'playerAction',
                states: {
                  playerAction,
                  endTurn: {
                    always: [
                      {
                        cond: 'isLastPlayerToTalk',
                        target: `#pokerGame.turn`,
                      },
                      {
                        target: 'nextPlayer',
                      },
                    ],
                  },
                  nextPlayer,
                },
              },
            },
          },
          turn: {
            initial: 'startRound',
            states: {
              startRound: {
                always: {
                  actions: ['handleTurn', 'checkIfAllIn'],
                  target: 'playerTurn',
                },
              },
              playerTurn: {
                initial: 'playerAction',
                states: {
                  playerAction,
                  endTurn: {
                    always: [
                      {
                        cond: 'isLastPlayerToTalk',
                        target: `#pokerGame.river`,
                      },
                      {
                        target: 'nextPlayer',
                      },
                    ],
                  },
                  nextPlayer,
                },
              },
            },
          },
          river: {
            initial: 'startRound',
            states: {
              startRound: {
                always: {
                  actions: ['handleRiver', 'checkIfAllIn'],
                  target: 'playerTurn',
                },
              },
              playerTurn: {
                initial: 'playerAction',
                states: {
                  playerAction,
                  endTurn: {
                    always: [
                      {
                        cond: 'isLastPlayerToTalk',
                        target: `#pokerGame.showdown`,
                        actions: 'handleShowDown',
                      },
                      {
                        target: 'nextPlayer',
                      },
                    ],
                  },
                  nextPlayer,
                },
              },
            },
          },
          showdown: {
            on: {
              RESTART: {
                actions: 'handleNextDealer',
                target: 'idle',
              },
            },
          },
        },
      },
      {
        guards: {
          isBetActive: (ctx) =>
            ctx.table.highestBet > ctx.table.currentPlayer.bet,
          hasMoreThanOnePlayer: (ctx) => ctx.table.hasMoreThanOnePlayer,
          hasLeastOnePlayer: (ctx) => ctx.table.hasLeastOnePlayer,
          isLastPlayerToTalk: (ctx) => ctx.table.isLastPlayerToTalk,
          isNotLastPlayerToTalk: (ctx) => !ctx.table.isLastPlayerToTalk,
          isTwoPlayerLeft: (ctx) => ctx.table.isTwoPlayerLeft,
        },
        actions: {
          addPlayer: (ctx, evt) => ctx.table.addPlayer(evt.player),
          removePlayer: (ctx, evt) => ctx.table.removePlayer(evt.player),
          check: (ctx) => ctx.table.check(),
          fold: (ctx) => ctx.table.fold(),
          bet: (ctx, evt) => ctx.table.bet(evt.amount),
          raise: (ctx, evt) => ctx.table.raise(evt.amount),
          call: (ctx) => ctx.table.call(),
          startNewHand: (ctx) => ctx.table.startNewHand(),
          setLastPlayerToTalk: (ctx) => ctx.table.setLastPlayerToTalk(),
          handleShowDown: (ctx) => {
            ctx.table.handleShowDown();
            ctx.eventEmitter.emit('startNewHand', { tableId: ctx.table.id });
          },
          handleWinWithouShowDown: (ctx) =>
            ctx.table.handleWinWithoutShowDown(),
          handleNextPlayer: (ctx) => ctx.table.handleNextPlayer(),
          handlePreflop: (ctx) => ctx.table.handlePreFlop(),
          handleFlop: (ctx) => ctx.table.handleFlop(),
          handleTurn: (ctx) => ctx.table.handleTurn(),
          handleRiver: (ctx) => ctx.table.handleRiver(),
          handleNextDealer: (ctx) => ctx.table.handleNextDealer(),
          checkIfAllIn: (ctx) =>
            ctx.eventEmitter.emit('checkIfAllIn', { tableId: ctx.table.id }),
        },
      },
    ),
  ).start();
