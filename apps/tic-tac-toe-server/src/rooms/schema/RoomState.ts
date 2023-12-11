import { Schema, type, ArraySchema } from "@colyseus/schema";
import { PlayerState } from "./PlayerState";
import { IRoomState } from "@natewilcox/tic-tac-toe-shared";

export class RoomState extends Schema implements IRoomState {

    isCPU = false;
    
    @type("string")
    currentTurn = "";

    @type("string")
    winner = "";
    
    @type(["string"]) 
    boardState = new ArraySchema<string>(" ", " ", " ", " ", " ", " ", " ", " ", " ");

    @type("boolean")
    ready = false;

    @type(PlayerState)
    playerX: PlayerState;

    @type(PlayerState)
    playerO: PlayerState;

    @type("number")
    index = 0;
}
