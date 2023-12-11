import { ArraySchema, Schema } from "@colyseus/schema";
import { IPlayerState } from "./IPlayerState";

export interface IRoomState extends Schema {

    isCPU: boolean;
    currentTurn: string;
    winner: string;
    boardState: ArraySchema<string>;
    ready: boolean;
    playerX: IPlayerState;
    playerO: IPlayerState;
    index: number;
}