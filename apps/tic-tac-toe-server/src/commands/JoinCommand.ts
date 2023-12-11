import { Command } from "@colyseus/command";
import { PublicRoom } from "../rooms/PublicRoom";
import { faker } from '@faker-js/faker';
import { PlayerState } from "../rooms/schema/PlayerState";

type Payload = {
    client: any
};

export class JoinCommand extends Command<PublicRoom, Payload> {

    async execute({ client }: Payload) {

        console.log("JoinCommand executed");
        const player = new PlayerState();
        player.client = client;
        player.name = faker.internet.userName();

        if(!this.room.state.playerX) {

            console.log('player assigned to X');
            this.room.state.playerX = player;
        }
        else {

            console.log('player assigned to O');
            this.room.state.playerO = player;
        }

        //add cpu player if not playing online.
        if(this.room.state.isCPU) {

            const cpu = new PlayerState();
            cpu.isCPU = true;
            cpu.client = null;
            cpu.name = faker.internet.userName();
            this.room.state.playerO = cpu;
        }

        //if max players have joined, start game
        if(this.room.state.playerX && this.room.state.playerO) {
            
            this.room.lock();

            //start game and set current turn
            this.room.state.ready = true;
            this.room.state.currentTurn = this.room.state.playerX.client?.id;
            console.log("game starting. X's turn");
        }
    }
}