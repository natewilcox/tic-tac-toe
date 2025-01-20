import { Room, Client } from "@colyseus/core";
import { RoomState } from "./schema/RoomState";
import { JoinCommand } from "../commands/JoinCommand";
import { Dispatcher } from "@colyseus/command";
import { LeaveCommand } from "../commands/LeaveCommand";
import { MakeMoveCommand } from "../commands/MakeMoveCommand";
import { RematchCommand } from "../commands/RematchCommand";
import { ClientMessages, ServerMessages } from "@natewilcox/tic-tac-toe-shared";
import { ClientService } from "../services/ClientService";
import { PushNotificationService } from "../services/PushNotificationService";

export class PrivateRoom extends Room<RoomState> {
  
    CLIENT: ClientService;
    NOTIFICATIONS: PushNotificationService;
    
    maxClients = 2;
    dispatcher: Dispatcher<PrivateRoom> = new Dispatcher(this);

    onCreate (options: any) {

        console.log("private room", this.roomId, "created...");
        this.setPrivate(true);
        this.setState(new RoomState());
        this.state.isCPU = !options.online;
        
        this.CLIENT = ClientService.getInstance(this);
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
        
        console.log("send public key to new client");
        this.CLIENT.send(ServerMessages.SetPublicKey, {
            publicKey: this.NOTIFICATIONS.publicKey()
        }, client);
    }

    async onLeave (client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");

        try {

            console.log("allowing reconnect to " + client._reconnectionToken);
            const reconnection = await this.allowReconnection(client, 60);
            console.log("reconnected");
        }
        catch(e) {
        
            console.log("timeout waiting for reconnect");
            this.dispatcher.dispatch(new LeaveCommand(), {
                client
            });
        }
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
