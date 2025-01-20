import { ClientMessages } from "@natewilcox/tic-tac-toe-shared";
import { Client, Room } from "colyseus";


export class ClientService {

    private static instance: ClientService;
    
    private room: Room;
    private clientHandlers = new Map<number, (client: Client, msg: any) => void>();

    private constructor(room: Room) {
        this.room = room;

        this.room.onMessage(ClientMessages.SendMessage, (client, data) => {
    
            const handler = this.clientHandlers.get(data.type);
       
            if(handler) {
                handler(client, data);
            }
        });

    }

    public static getInstance(room: Room): ClientService {

        if (!ClientService.instance) {
            ClientService.instance = new ClientService(room);
        }

        return ClientService.instance;
    }
    
    send(msgType: number, data?: any, client?: Client) {

        if(client) {
            
            client.send(ClientMessages.SendMessage, {
                type: msgType,
                ...data,
            });
            return;
        }
        else {
            this.room.broadcast(ClientMessages.SendMessage, {
                type: msgType,
                ...data,
            });
        }
    }

    on(msgType: number, cb: (client: Client, data: any) => void, context?: any) {
        this.clientHandlers.set(msgType, cb);
    }
}