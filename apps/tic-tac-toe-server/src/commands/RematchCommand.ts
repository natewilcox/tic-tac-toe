import { Command } from "@colyseus/command";
import { PublicRoom } from "../rooms/PublicRoom";
import { RestartGameCommand } from "./RestartGameCommand";

type Payload = {
    client: any
};

export class RematchCommand extends Command<PublicRoom, Payload> {

    async execute({ client }: Payload) {

        console.log("RematchCommand executed");

        //determine who offered a rematch
        if(client.id == this.room.state.playerX.client?.id) {
            this.room.state.playerX.offerRematch = true;
        }

        if(client.id == this.room.state.playerO.client?.id) {
            this.room.state.playerO.offerRematch = true;
        }

        //if both agree to rematch, or playing a cpu, restart game
        if((this.room.state.playerX.offerRematch && this.room.state.playerO.offerRematch) || this.room.state.isCPU) {
            console.log("start rematch");
            this.room.dispatcher.dispatch(new RestartGameCommand(), {
                client
            });
        }
    }
}