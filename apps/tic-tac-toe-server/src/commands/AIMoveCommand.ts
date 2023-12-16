import { Command } from "@colyseus/command";
import { PublicRoom } from "../rooms/PublicRoom";
import { ArraySchema } from "@colyseus/schema";
import { ServerMessages } from "@natewilcox/tic-tac-toe-shared";
import { checkWinner, cpuReadyUp, numberToXYCoordinate, sendPushNotification } from "../utils/GameUtils";

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
            const x = numberToXYCoordinate(nextMove).y;
            const y = numberToXYCoordinate(nextMove).x;
            this.room.state.boardState[nextMove] = currentPlayer;

            console.log(`--AI setting [${x},${y}] to ${currentPlayer}--`);
            console.log(`${this.state.boardState[0]},${this.state.boardState[1]},${this.state.boardState[2]}`);
            console.log(`${this.state.boardState[3]},${this.state.boardState[4]},${this.state.boardState[5]}`);
            console.log(`${this.state.boardState[6]},${this.state.boardState[7]},${this.state.boardState[8]}`);

            const nextPlayer = currentPlayer == 'X' ? this.room.state.playerO : this.room.state.playerX;
            this.room.state.currentTurn = currentPlayer == 'X' ? nextPlayer.client?.id : nextPlayer.client?.id;

            sendPushNotification(nextPlayer.subscription, "Your Turn", "It's your turn to play!");
            
            //check for winner
            if(checkWinner(this.room.state.boardState)) {

                console.log("cpu won");
                this.room.state.winner = "cpu";

                cpuReadyUp(this.room.state);
            }

            //if no one wins after last move, everyone loses.
            if(this.room.state.boardState.find(c => c != 'X' && c != 'O') == null) {
                console.log("game ended in tie");
                this.room.state.winner = 'tie';
                
                cpuReadyUp(this.room.state);
            }

            this.room.CLIENT.send(ServerMessages.MoveMade, { x, y, marker: currentPlayer });
        }, 3000);
    }
}

