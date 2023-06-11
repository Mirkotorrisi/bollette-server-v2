import { createMachine, interpret } from 'xstate';
import { Table } from '../models/table.model';
import { HandRound } from '../utils/types';

export interface Ctx {
  table: Table;
}

const playerAction = {
  on: {
    RAISE: {
      cond: 'isBetActive',
      actions: ['raise', 'setLastPlayerToTalk'],
      target: 'endTurn',
    },
    CALL: {
      cond: 'isBetActive',
      actions: 'call',
      target: 'endTurn',
    },
    FOLD: {
      actions: 'fold',
      target: 'endTurn',
    },
    CHECK: {
      actions: 'check',
      target: 'endTurn',
    },
    BET: {
      actions: ['bet', 'setLastPlayerToTalk'],
      target: 'endTurn',
    },
  },
};

const nextPlayer = {
  always: {
    target: 'playerAction',
    actions: 'handleNextPlayer',
  },
};

const onePlayerNextRoundState = {
  target: '#pokerGame.idle',
  cond: 'isOnePlayerLeft',
  actions: ['handleWinWithouShowDown', 'handleNextDealer'],
};

export const getPokerMachine: any = (table: Table) =>
  interpret(
    createMachine<Ctx>(
      {
        /** @xstate-layout N4IgpgJg5mDOIC5QAcD2BrMAnA4gQwFswA6ASwgBswBiAbQAYBdRFVWUgF1NQDsWQAHogCMATgAsADmL0ArADZ69UaNmz64+QBoQAT0QBmYQfHEATKMmTNogwYWSAvo51pMuQiWRYwAMQqoyMSwHHhYHABKqACuPBB0TPxo7Fy8-EIIZnayxKIA7AaSwvLyKkYGOvoIBsp5xEZmwuLCwvSSZvJmss6uGNj4RMTefgFByBR4utgAKtFYPEMTU1gAggDGqTzUESsAkgDKAKIMzEggyZzcfGcZZuIG8jLFxpIKJeIKlYbyH8SSlpYOsJJDUzD1zn0PINhv5AotJjM5gtxgjVhsrtQAMIrAAyOJOSTYlzSN0QdweT3kLzeP0+ekMeXk0jy4ksbTsILyeW6Lgh7gGXh8sLGS0R83hy3Wm2ovgA8jiACIEs4XTbpMn3R70Z6FGkfbT06qSH65YwWIGvMz0MG8tz9TxDIWjCVi5GitHSzEACUOmIA0srWCkrurMprKdSSrSDVUDKIqTJGVymZYSgZwXaoYKRnCUctZuK89gpRiAEKHaaBiHBkmgW7h7VU3VR-VfaqyLIyKTCByAjriDOQgWOnMi1EFhZgOIThKnIPE651wwtR7CRmqJTqWQ1GOGURyU2KUpx1ptHm9fkOmHOotYCfEKcQGe0YRz6sL0NmJPETqNVP3dQSjbAw8kkOpxCyWxNBZPIvzyQdL2hJ1c3de8eDAAQOAABXdWdCRrRdBDJb9fzEY0APoIDDQ5ehchKBQxFkHt7gQ+0kNHYh0MwqJYniKtVRDUkEA7NsimIVkWiUSjJDaIoB1tIcr2QoIuMiGI4joV98I-ISxCkGQFCUFQ1A0XcEHuY1iAKIxxC5egTE0Vis2IAAzZ0QjCNTeLwlUiTVISzEC8wrHkOxuRqWQVDbDppFs8RWUozpLCMeQnOHNyUPHJEXQ9DEdgOY5El8gjQwMIK7Faej7h7PJRLXGQqWtGpYIkew0odDKx3zbLbxLXgsVxfEivnfyl2qcqjES2RqtkWrDVsURTWBKQ8lsbVRGEdrBk6nL7169F+rlRV+L8wSxrKsx6kmqqjFmttWgpehwrsJ6UuBLaSB2289vdPqtm9X0A2G99RqI8bLoqqaZrmqoWjK8xCiKAptxqD4Ptcm9UJ636Dq2ctK2BgTazBi6rsq+RptumHEFKUxGg0MQyLjUL0a+rHxUfZ9CdO4mMlPS6JK5PJgSKCnZHup66ieoplGsBR1HTBTEM+zGso56ckU0t8icIjIKYMXIQOtWaiiaHs21UaRZFeY0LE0ForFZ1XuvFVScNRHyRrOsH9cNvJjdAlpmnFw01Eu4QzCsO4ujXM0nbhVSeI0k6St0roDdm63KIeFkRMNJouWIWarTja3-eteOVIwrzk604qdLGiPtyL7kZNC+Rc7Me6xAz9dWojmSWKVtiSA4bKPPCJO+O51PG9KOomVL1qClESP7vEDRxO1ezFH+aw5HRsfC3Zt1UT+7Y9iOFOG7Btd8isjpI+MDRYLUe7VEuyxuVX4oZJ7G0Lwj2IEfU+LtQHFlxgNPE19QZ81WnUWCnQiio1fiHKoVpuR-EKF0CmHwrBgUPtjNW4DcqHXlEqGeN84H30QU-FBXQ0FkjXJdJQv9tw-B+LYQhx9iE5XPgDf0MDvbUIQY-ZBL8GHRRisQYoW4wKBWtCybhJCfpn0gfjIRvMRDwIfkg5+tlJH5xBLRYwTIuRG39oUZRu1sqc01po3WGpC4hRUHpfIJgu6GkCsYGQGh1AgmmqoVKw9nIgJserJ89i65ey0ZkCOi07CBQ3tNL8whorKFMExLIwI1wtTuNY762U3a4QcZ+eJV0klyAgsLe6TJpByA7O0CCG8rTBMAaEop1cp6exBsI4ikdcjC2tC0Cw1o2jRVZDkTc8ZF6KPgiE4cYTE7qT4tE3psS85VHuBIGRlgQTlA3vkdGWBSAADdsDBFCJPFZPSdafnhpHY0YVtyUW1OIYCiUfzKGzqydxxhjlnIuYUnhkpIH5SvpQ2Bhh4aQxuj2JkwEqQ5EYiyB4HcFDcgBecrA4SSH8MGqUoSiSyZQ1ugi6iBR6maDwdSsCogsVApPnwyBR0KHax5o46oMLrq4LJZIYCII6bKAkF+D41oAF8iASc7FuLmWeh9IIyFfSuUQx5ZTeF-LqJrXqAUapxtZEMpxcCvF6iKyEvOty8m6qHDAVZBDMVq1I7xgkPM9pw5pWMt4XY+YtyOWhlaBHcSG0hYi1kWk6iYEciNFSaoNcTFNoLIdB6o1TLvVbBfOy2ePtQp+wDqbZo4bYzckeLBOQFg7CWFsoa2VxSPbmuzQbWw-suiBzNoW6F6hzChSkPce42omjVuWd5etfMOi9yzu3XOxQ2zNDsD+Locg5DNUCoOrpNyM3aShQgCOObM5txzh8adhoIIdj+BTBaQd6WJsGLAAAFqgAA7hAR96alWxOKJg5QkV9xrlsrBGdkkZD2FpIyNcFdwQ8FQBAOAhJlabuVQAWgjm2BDWopLofQxYJw16SDkCoPB99rxFq2WUEbDsJhQIzpaQjFkgV8hh0Vm6pSo4COcsaKyH8rxgR206NuD5yg-jRtCk0DouD0bXjhBPGuEBWOfitLRJkTF2gSF4xUaiLRFoF3NI63j4nlK4tkwFMQC8uPKc0OnYC5bxLPVPMUCwemOLGrld7O5AU7g5EU9xlTFnqLNFMIyEw+5I2hXPJK5yEmuqugfBreYhmxodGbsYfIVJWmUQKMBR1MguNPUaCl40DnhQ1uru7ZYcWwZ20WqvWyrxFDAnjLa1ofwQTGiS6wxjYXhwRc4mu3iZXbiNA86ZnjPmtlYfMC0qka4rCUUrn17490ZK5H2TYDuVJ4yV0uZ5Kec2EBgWivueoygfhZFsiYKkG3jU7esDOk0oVGQyTUN2o5OGMaZTAc54mrnG5lTbNbHIq9M5GFbqZC7qaYuES+2DbcxHprW0FUbQKFsc13GFrZDuT1ShXqY9tZ2UXa2lfrlukEjxIIpZXi80Qv32hdhSw8H97Q2kdY6s6IdcQdutE8bDGwW8siNjsPFV1TPBggPZ-G+oqgyoOHuGVMyxhii5FlnIJLq9BeZkWePK50nRedHF9uHB1hEmy4giTh4VpV7WmpYztXDowmXcJ8qnskVdeS6ZNLjotSlBF2O10ZKGCClMv2qDSHfNFB1FLi7g3Mv7qwWEH8DswIY-TfWy923YPImxft7Eq0TQ-ishkpNDsNSvHCpkcjEEzE7D+94fj7AO3smx+7e0bk28VCy+FnUfIHQlCBapIyaxrOZOZ85TVMPEv9du7Ml3nIZUDcYIkJReS2OSDJp25ofbq0ZFTcl3ntcVvFKDGTZt65vWh+hnyB8qw4l4rRw2tV0L1uD+ApTcQnbEhLM665IFFGa1LDVqc4HlzP1XSCCYCQoUwV5QoDaECGSA+F7Q-JzNNHbQJcSWHKwEwBHDLBMQoONXVMdP-JlGvLAK7TQBGeMCOcnCKUAxbYEaWaApoIoVdbiFZdnZDY9DoOodhDaZ+F5TFF7O9R9Z9B9CHIAxuFJZ3cfRJADIwP4f2eBeKI8HkZwIAA */
        id: 'pokerGame',
        initial: 'idle',
        context: {
          table,
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
                  actions: 'handlePreflop',
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
                        target: `#pokerGame.preFlop.nextRound`,
                      },
                      {
                        target: 'nextPlayer',
                      },
                    ],
                  },
                  nextPlayer,
                },
              },
              nextRound: {
                always: [
                  {
                    target: `#pokerGame.flop`,
                    cond: 'isMoreThanOnePlayerOnHand',
                  },
                  onePlayerNextRoundState,
                ],
              },
            },
          },
          flop: {
            initial: 'startRound',
            states: {
              startRound: {
                always: {
                  actions: 'handleFlop',
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
                        target: `#pokerGame.flop.nextRound`,
                      },
                      {
                        target: 'nextPlayer',
                      },
                    ],
                  },
                  nextPlayer,
                },
              },
              nextRound: {
                always: [
                  {
                    target: `#pokerGame.turn`,
                    cond: 'isMoreThanOnePlayerOnHand',
                  },
                  onePlayerNextRoundState,
                ],
              },
            },
          },
          turn: {
            initial: 'startRound',
            states: {
              startRound: {
                always: {
                  actions: 'handleTurn',
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
                        target: `#pokerGame.turn.nextRound`,
                      },
                      {
                        target: 'nextPlayer',
                      },
                    ],
                  },
                  nextPlayer,
                },
              },
              nextRound: {
                always: [
                  {
                    target: `#pokerGame.river`,
                    cond: 'isMoreThanOnePlayerOnHand',
                  },
                  onePlayerNextRoundState,
                ],
              },
            },
          },
          river: {
            initial: 'startRound',
            states: {
              startRound: {
                always: {
                  actions: 'handleRiver',
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
                        target: `#pokerGame.river.nextRound`,
                      },
                      {
                        target: 'nextPlayer',
                      },
                    ],
                  },
                  nextPlayer,
                },
              },
              nextRound: {
                always: [
                  {
                    target: `#pokerGame.showdown`,
                    cond: 'isMoreThanOnePlayerOnHand',
                  },
                  onePlayerNextRoundState,
                ],
              },
            },
          },
          showdown: {
            always: {
              target: 'idle',
              actions: ['handleShowDown', 'handleNextDealer'],
            },
          },
        },
      },
      {
        guards: {
          isBetActive: (ctx) =>
            ctx.table.highestBet > ctx.table.currentPlayer.bet,
          hasMoreThanOnePlayer: (ctx) => !!ctx.table.players.length,
          isMoreThanOnePlayerOnHand: (ctx) => ctx.table.players.length > 1,
          isLastPlayerToTalk: (ctx) => ctx.table.isLastPlayerToTalk,
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
          handleShowDown: (ctx) => ctx.table.handleShowDown(),
          handleWinWithouShowDown: (ctx) =>
            ctx.table.handleWinWithoutShowDown(),
          handleNextPlayer: (ctx) => ctx.table.handleNextPlayer(),
          handlePreflop: (ctx) => (ctx.table.currentRound = HandRound.PRE_FLOP),
          handleFlop: (ctx) => ctx.table.handleFlop(),
          handleTurn: (ctx) => ctx.table.handleTurn(),
          handleRiver: (ctx) => ctx.table.handleRiver(),
          handleNextDealer: (ctx) => ctx.table.handleNextDealer(),
        },
      },
    ),
  ).start();
