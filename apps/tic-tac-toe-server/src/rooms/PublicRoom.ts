import { Room, Client } from "@colyseus/core";
import { RoomState } from "./schema/RoomState";
import { JoinCommand } from "../commands/JoinCommand";
import { Dispatcher } from "@colyseus/command";
import { LeaveCommand } from "../commands/LeaveCommand";
import { MakeMoveCommand } from "../commands/MakeMoveCommand";
import { RematchCommand } from "../commands/RematchCommand";
import { ClientService } from "@natewilcox/colyseus-nathan";
import { ClientMessages } from "@natewilcox/tic-tac-toe-shared";

export class PublicRoom extends Room<RoomState> {
  
    CLIENT: ClientService<ClientMessages>;
    maxClients = 2;
    dispatcher: Dispatcher<PublicRoom> = new Dispatcher(this);

    onCreate (options: any) {

        console.log(options)
        console.log("public room", this.roomId, " is created...");
        this.setState(new RoomState());
        this.state.isCPU = !options.online;
        
        this.CLIENT = new ClientService(this);
        this.CLIENT.on(ClientMessages.MakeMove, (client, data) => {
            this.dispatcher.dispatch(new MakeMoveCommand(), {
                client,
                ...data
            });
        });

        this.CLIENT.on(ClientMessages.Rematch, (client) => {
            this.dispatcher.dispatch(new RematchCommand(), {
                client
            });
        });
    }

    onJoin (client: Client, options: any) {
        console.log(client.sessionId, "joined!");
        this.dispatcher.dispatch(new JoinCommand(), {
            client
        });
    }

    async onLeave (client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");

        this.dispatcher.dispatch(new LeaveCommand(), {
            client
        });
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
