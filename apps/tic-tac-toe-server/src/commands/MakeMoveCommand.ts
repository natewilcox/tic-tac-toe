import { Command } from "@colyseus/command";
import { PublicRoom } from "../rooms/PublicRoom";
import { AIMoveCommand } from "./AIMoveCommand";
import { ArraySchema } from "@colyseus/schema";
import { ServerMessages } from "@natewilcox/tic-tac-toe-shared";
import { checkWinner, cpuReadyUp, printBoard } from "../utils/GameUtils";

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
        printBoard(this.room.state.boardState);

        //check for winner after player move
        if(checkWinner(this.room.state.boardState)) {
            
            console.log(`${client.id} won!`);
            this.room.state.winner = client.id;
            this.room.CLIENT.send(ServerMessages.MoveMade, { x, y, marker });

            cpuReadyUp(this.room.state);

            return;
        }

        //if no one wins after last move, everyone loses.
        if(this.room.state.boardState.find(c => c != 'X' && c != 'O') == null) {
            console.log("game ended in tie");
            this.room.state.winner = 'tie';
            this.room.CLIENT.send(ServerMessages.MoveMade, { x, y, marker });

            cpuReadyUp(this.room.state);

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
}