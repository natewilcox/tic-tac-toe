import { Schema, type } from "@colyseus/schema";
import { IPlayerState } from "@natewilcox/tic-tac-toe-shared";
import { Client } from "colyseus";

export class PlayerState extends Schema implements IPlayerState {

    isCPU = false;
    client: Client;

    @type("string")
    name = "";
    
    @type("boolean")
    offerRematch = false;
}
