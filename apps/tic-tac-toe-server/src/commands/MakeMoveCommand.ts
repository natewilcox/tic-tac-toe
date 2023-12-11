import { Command } from "@colyseus/command";
import { PublicRoom } from "../rooms/PublicRoom";
import { AIMoveCommand } from "./AIMoveCommand";
import { ArraySchema } from "@colyseus/schema";
import { ServerMessages } from "@natewilcox/tic-tac-toe-shared";

type Payload = {
    client?: any,
    x: number,
    y: number
};

export class MakeMoveCommand extends Command<PublicRoom, Payload> {

    async execute({ client, x, y }: Payload) {

        console.log("MoveMoveCommand executed");

        //check to make sure the space isnt already taken
        if(this.room.state.boardState[(y*3) + x] != ' ') {
            return;
        }

        const marker = client.id == this.room.state.playerX.client?.id ? "X" : "O";

        //board state is a 1-dimensional array. map the xy coords to cell in array
        this.room.state.boardState[(y*3) + x] = marker;

        console.log(`--Player setting [${x},${y}] to ${marker}--`);
        console.log(`${this.state.boardState[0]},${this.state.boardState[1]},${this.state.boardState[2]}`);
        console.log(`${this.state.boardState[3]},${this.state.boardState[4]},${this.state.boardState[5]}`);
        console.log(`${this.state.boardState[6]},${this.state.boardState[7]},${this.state.boardState[8]}`);

        //check for winner
        if(this.checkWinner(this.room.state.boardState)) {
            console.log(`${client.id} won!`);
            this.room.state.winner = client.id;
            this.room.CLIENT.send(ServerMessages.MoveMade, { x, y, marker });
            return;
        }

        //if no one wins after last move, everyone loses.
        if(this.room.state.boardState.find(c => c != 'X' && c != 'O') == null) {
            console.log("game ended in tie");
            this.room.state.winner = 'tie';
            this.room.CLIENT.send(ServerMessages.MoveMade, { x, y, marker });
            return;
        }

        //if this is a CPU game, trigger the CPU to move.
        //otherise, toggle to other player
        if(this.room.state.isCPU) {

            console.log("CPU is making their move");
            this.room.state.currentTurn = "cpu";
            this.room.dispatcher.dispatch(new AIMoveCommand(), {
                currentPlayer: marker == 'X' ? 'O' : 'X'
            });
        }
        else {
            this.room.state.currentTurn = marker == 'X' ? this.room.state.playerO.client?.id : this.room.state.playerX.client?.id;
        }

        this.room.CLIENT.send(ServerMessages.MoveMade, { x, y, marker });
    }

    //AI Generated Method to check for winner
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