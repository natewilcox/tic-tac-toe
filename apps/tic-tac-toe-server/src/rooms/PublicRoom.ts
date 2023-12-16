import { Room, Client } from "@colyseus/core";
import { RoomState } from "./schema/RoomState";
import { JoinCommand } from "../commands/JoinCommand";
import { Dispatcher } from "@colyseus/command";
import { LeaveCommand } from "../commands/LeaveCommand";
import { MakeMoveCommand } from "../commands/MakeMoveCommand";
import { RematchCommand } from "../commands/RematchCommand";
import { ClientService } from "@natewilcox/colyseus-nathan";
import { ClientMessages, ServerMessages } from "@natewilcox/tic-tac-toe-shared";

const publickey = "BCjma1am3LNrPBqf7eJkKyF8HYkE0jLX8RXICl00eNLBdA-4sf9moRDHwmV_hyg5lUyhA1BJaXXQOtX14SA--vw";
const privatekey = "L-oG0LJMdU46jnIs1DbN17SdYPKG_8Xh7bTxYjrdDLo";

export class PublicRoom extends Room<RoomState> {
  
    CLIENT: ClientService<ClientMessages>;
    maxClients = 2;
    dispatcher: Dispatcher<PublicRoom> = new Dispatcher(this);

    onCreate (options: any) {

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

        console.log("public key");
        this.CLIENT.send(ServerMessages.SetPublicKey, {
            publickey: publickey
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