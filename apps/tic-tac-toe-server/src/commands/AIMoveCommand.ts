import { Command } from "@colyseus/command";
import { PublicRoom } from "../rooms/PublicRoom";
import { ArraySchema } from "@colyseus/schema";
import { ServerMessages } from "@natewilcox/tic-tac-toe-shared";

const Minimax = require('tic-tac-toe-minimax');

type Payload = {
    currentPlayer: 'X' | 'O'
};

interface MoveCoordinates {
    x: number;
    y: number;
  }

export class AIMoveCommand extends Command<PublicRoom, Payload> {

    async execute({ currentPlayer }: Payload) {

        console.log("AIMoveCommand executed");

        this.clock.setTimeout(() => {

            let i=0;
            const board: any[] = [];
            this.state.boardState.forEach(c => { 
                board.push(c != ' ' ? c : i);
                i++;
            });

            console.log(board)
            const difficulty = "Normal";
            const symbols = {
                huPlayer: "X",
                aiPlayer: "O"
            }

            console.log(`Checking best move for ${currentPlayer}`);
            const nextMove = Minimax.default.ComputerMove(board, symbols, difficulty);
            const x = this.numberToXYCoordinate(nextMove).y;
            const y = this.numberToXYCoordinate(nextMove).x;
            this.room.state.boardState[nextMove] = currentPlayer;

            console.log(`--AI setting [${x},${y}] to ${currentPlayer}--`);
            console.log(`${this.state.boardState[0]},${this.state.boardState[1]},${this.state.boardState[2]}`);
            console.log(`${this.state.boardState[3]},${this.state.boardState[4]},${this.state.boardState[5]}`);
            console.log(`${this.state.boardState[6]},${this.state.boardState[7]},${this.state.boardState[8]}`);

            this.room.state.currentTurn = currentPlayer == 'X' ? this.room.state.playerO.client?.id : this.room.state.playerX.client?.id;

            //check for winner
            if(this.checkWinner(this.room.state.boardState)) {
                console.log('cpu won the game');
                this.room.state.winner = "cpu";
            }

            //if no one wins after last move, everyone loses.
            if(this.room.state.boardState.find(c => c != 'X' && c != 'O') == null) {
                console.log("game ended in tie");
                this.room.state.winner = 'tie';
            }

            this.room.CLIENT.send(ServerMessages.MoveMade, { x, y, marker: currentPlayer });
        }, 1000);
    }

    private numberToXYCoordinate = (number: number)=> {
        if (number < 0 || number > 8) {
          throw new Error('Number must be in the range of 0 to 8');
        }
      
        const x = Math.floor(number / 3);
        const y = number % 3;
      
        return { x, y };
    }


      
    private checkWinner = (board: ArraySchema<string>) => {
     
      for (let row = 0; row < 3; row++) {
          if (
              board[row * 3] === board[row * 3 + 1] &&
              board[row * 3] === board[row * 3 + 2] &&
              board[row * 3] !== ' '
          ) {
              return board[row * 3];
          }
      }
    
      for (let col = 0; col < 3; col++) {
          if (
              board[col] === board[col + 3] &&
              board[col] === board[col + 6] &&
              board[col] !== ' '
          ) {
              return board[col];
          }
      }
    
      // Check diagonals
      if (
          (board[0] === board[4] && board[0] === board[8]) ||
          (board[2] === board[4] && board[2] === board[6])
          ) {
          if (board[4] !== ' ') {
              return board[4];
          }
      }
    
      // If no winner is found, return null
      return null;
    }
}

