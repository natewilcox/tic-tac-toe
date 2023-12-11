import { Command } from "@colyseus/command";
import { PublicRoom } from "../rooms/PublicRoom";

type Payload = {
    client: any
};

export class LeaveCommand extends Command<PublicRoom, Payload> {

    async execute({ client }: Payload) {

        console.log("LeaveCommand executed");

        //if there is no winner, declare the other player the winner when dropping
        if(!this.room.state.winner) {
            this.room.state.winner = client?.id == this.room.state.playerX?.client?.id ? this.room.state.playerO?.client?.id : this.room.state.playerX?.client?.id;
        }
    }
}