import { Command } from "@colyseus/command";
import { PublicRoom } from "../rooms/PublicRoom";
import { ArraySchema } from "@colyseus/schema";
import { AIMoveCommand } from "./AIMoveCommand";
import { ServerMessages } from "@natewilcox/tic-tac-toe-shared";

type Payload = {
    client: any
};

export class RestartGameCommand extends Command<PublicRoom, Payload> {

    async execute({ client }: Payload) {

        console.log("RestartGameCommand executed");

        this.room.CLIENT.send(ServerMessages.Restart);

        //reset game state
        this.room.state.winner = "";
        this.room.state.ready = true;
        this.room.state.boardState = new ArraySchema<string>(" ", " ", " ", " ", " ", " ", " ", " ", " ");
        this.room.state.playerX.offerRematch = false;
        this.room.state.playerO.offerRematch = false;

        //swap sides
        console.log('swap sides');
        console.log('playerX=' + this.room.state.playerX?.client?.id);
        console.log('playerO=' + this.room.state.playerO?.client?.id);

        let temp: any = this.room.state.playerX;
        this.room.state.playerX = this.room.state.playerO;
        this.room.state.playerO = temp;

        console.log('after swap');
        console.log('playerX=' + this.room.state.playerX?.client?.id);
        console.log('playerO=' + this.room.state.playerO?.client?.id);

        //set current turn to X, and notify clients of restart
        this.room.state.currentTurn = this.room.state.playerX.client?.id;
        console.log("currentTurn=" + this.room.state.currentTurn);

        //if cpu is first, dispatch AI move
        if(!this.room.state.playerX.client) {
            
            console.log("AI's turn");
            this.room.dispatcher.dispatch(new AIMoveCommand(), {
                currentPlayer: 'X'
            });
        }
    }
}