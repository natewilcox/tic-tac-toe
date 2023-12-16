import { ArraySchema } from "@colyseus/schema";
import { RoomState } from "../rooms/schema/RoomState";
import * as webpush from 'web-push';

const publickey = "BCjma1am3LNrPBqf7eJkKyF8HYkE0jLX8RXICl00eNLBdA-4sf9moRDHwmV_hyg5lUyhA1BJaXXQOtX14SA--vw";
const privatekey = "L-oG0LJMdU46jnIs1DbN17SdYPKG_8Xh7bTxYjrdDLo";

webpush.setVapidDetails(
    'mailto:natewilcox@gmail.com',
    publickey,
    privatekey
);

export const checkWinner = (board: ArraySchema<string>) => {
     
    for (let row = 0; row < 3; row++) {
        if (
            board[row * 3] === board[row * 3 + 1] &&
            board[row * 3] === board[row * 3 + 2] &&
            board[row * 3] !== ' '
        ) {
            return board[row * 3];
        }
    }
  
    for (let col = 0; col < 3; col++) {
        if (
            board[col] === board[col + 3] &&
            board[col] === board[col + 6] &&
            board[col] !== ' '
        ) {
            return board[col];
        }
    }
  
    // Check diagonals
    if (
        (board[0] === board[4] && board[0] === board[8]) ||
        (board[2] === board[4] && board[2] === board[6])
        ) {
        if (board[4] !== ' ') {
            return board[4];
        }
    }
  
    // If no winner is found, return null
    return null;
}

export const numberToXYCoordinate = (number: number)=> {
    if (number < 0 || number > 8) {
      throw new Error('Number must be in the range of 0 to 8');
    }
  
    const x = Math.floor(number / 3);
    const y = number % 3;
  
    return { x, y };
}

export const printBoard = (board: ArraySchema<string>) => {
    console.log(`${board[0]},${board[1]},${board[2]}`);
    console.log(`${board[3]},${board[4]},${board[5]}`);
    console.log(`${board[6]},${board[7]},${board[8]}`);
}

export const cpuReadyUp = (roomState: RoomState) => {

    if(roomState.playerO.isCPU) {
        console.log("CPU wants to play again");
        roomState.playerO.offerRematch = true;
    }
    else if (roomState.playerX.isCPU) {
        console.log("CPU wants to play again");
        roomState.playerX.offerRematch = true;
    }
}

export async function sendPushNotification(subscription: any, title: string, body: string) {

    const payload = JSON.stringify({ title, body });

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
}