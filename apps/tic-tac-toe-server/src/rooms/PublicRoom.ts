import { Room, Client } from "@colyseus/core";
import { RoomState } from "./schema/RoomState";
import { JoinCommand } from "../commands/JoinCommand";
import { Dispatcher } from "@colyseus/command";
import { LeaveCommand } from "../commands/LeaveCommand";
import { MakeMoveCommand } from "../commands/MakeMoveCommand";
import { RematchCommand } from "../commands/RematchCommand";
import { ClientService } from "@natewilcox/colyseus-nathan";
import { ClientMessages, ServerMessages } from "@natewilcox/tic-tac-toe-shared";
import * as webpush from 'web-push';

const publickey = "BCjma1am3LNrPBqf7eJkKyF8HYkE0jLX8RXICl00eNLBdA-4sf9moRDHwmV_hyg5lUyhA1BJaXXQOtX14SA--vw";
const privatekey = "L-oG0LJMdU46jnIs1DbN17SdYPKG_8Xh7bTxYjrdDLo";

webpush.setVapidDetails(
    'mailto:natewilcox@gmail.com',
    publickey,
    privatekey
);

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

        console.log(ClientMessages.SetSubscription)
        this.CLIENT.on(ClientMessages.SetSubscription, async (client, data) => {

            const subscription = JSON.parse(data.subscription);
            console.log("subscription", subscription);

            this.clock.setTimeout(async () => {

                const payload = JSON.stringify({
                    title: 'test',
                    body: 'test'
                });
    
                try {
                    console.log("sending notification")
                    console.log('Subscription:', subscription);
                    console.log('Payload:', payload);

                    await webpush.sendNotification(subscription, payload)
                }
                catch (err: any) {
                    console.log('Error message:', err.message);
                    console.log('Status code:', err.statusCode);
                    console.log('Stack trace:', err.stack);
                }

            }, 5000);
        });
    }

    onJoin (client: Client, options: any) {
        console.log(client.sessionId, "joined!");
        this.dispatcher.dispatch(new JoinCommand(), {
            client
        });

        console.log("sending public key");
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
