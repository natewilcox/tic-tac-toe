import type { Schema } from "@colyseus/schema";

export interface IPlayerState extends Schema {

    isCPU: boolean;
    client: any;
    name: string;
    offerRematch: boolean;
}