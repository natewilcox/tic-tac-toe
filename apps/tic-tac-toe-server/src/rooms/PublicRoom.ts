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

export class PublicRoom extends Room<RoomState> {
  
    CLIENT: ClientService;
    NOTIFICATIONS: PushNotificationService;

    maxClients = 2;
    dispatcher: Dispatcher<PublicRoom> = new Dispatcher(this);

    onCreate (options: any) {

        console.log("public room", this.roomId, " is created...");
        this.setState(new RoomState());
        this.state.isCPU = !options.online;
        
        this.CLIENT = ClientService.getInstance(this)
        this.NOTIFICATIONS = PushNotificationService.getInstance();

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

        this.CLIENT.on(ClientMessages.SetSubscription, async (client, data) => {

            const subscription = JSON.parse(data.subscription);
            const player = this.state.playerX?.client?.id === client?.id ? this.state.playerX : this.state.playerO;

            const name = this.state.playerX?.client?.id === client?.id ? "playerX" : "playerO";
            console.log("recieving subscription", subscription, "from", name);
            player.subscription = subscription;
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

        this.dispatcher.dispatch(new LeaveCommand(), {
            client
        });
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}