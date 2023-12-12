import { ServerService } from "@natewilcox/phaser-nathan";
import { ClientMessages, IRoomState, ServerMessages } from "@natewilcox/tic-tac-toe-shared";
import * as Colyseus from "colyseus.js";
import 'dotenv/config'
import { BaseScene } from "./BaseScene";

export class GameScene extends BaseScene
{
    //board entities
    private match: Phaser.GameObjects.Text;
    private status: Phaser.GameObjects.Text;
    private back: Phaser.GameObjects.Text;
    private rematch: Phaser.GameObjects.Text;
    private rematchBadge: Phaser.GameObjects.Image;  
    private markers: Phaser.GameObjects.Text[] = [];  
    private boardGraphics: Phaser.GameObjects.Graphics;
    private fullscreen: Phaser.GameObjects.Image; 
    private board = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' '],
    ];

    SERVER: ServerService<IRoomState, ClientMessages>;

    constructor () {
        super('game');
    }

    async create(config?: any) {
        super.create();
        
        this.configureResize(this);
        const url = `${process.env.HOST}`;
        console.log(`Connecting to: ${url}`);
        
        this.SERVER = new ServerService(url);
        console.log("playing game");

        //get room info. private if invited. public if not
        let online = config.online;
        let roomName = !config.invite ? 'tictactoe_public_room' : 'tictactoe_private_room';
        let roomId = config.inviteCode;

        try {
            console.log(`joining ${roomName}`);
            await this.SERVER.connect(roomName, { roomId, online });
        }
        catch(e) {
            console.error(`unable to join ${roomName}. Returning to lobby`, e);
            this.handleBack();
        }

        this.onScreenResized(() => {
            this.drawBoard();
            this.drawMarkers();
        });

        this.drawBoard();
        this.configureStateListeners();

        if(config.invite) {

            //send invite
            const inviteUrl = `https://tic-tac-toe.natewilcox.io?invite=${this.SERVER.RoomId}`;
            var smsUri = 'sms:?body=' + encodeURIComponent(`I challenge you at ${inviteUrl}`);

            // Open the messaging app with the default message
            window.open(smsUri, '_blank');
        }

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.off('pointerdown');
        })
    }

    private configureStateListeners = () => {

        this.SERVER.onRoomStateChange(this.handleRoomStateChange);

        this.SERVER.on(ServerMessages.MoveMade, (move) => {
            this.placeMarker(move.x, move.y, move.marker);
        });

        this.SERVER.on(ServerMessages.Restart, () => {
            console.log('restarting');
            this.rematch.setVisible(false);
            this.rematchBadge.setVisible(false);
            this.resetBoard();
        });

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            console.log('teardown scene')
            this.input.off('pointerdown');
            this.resetBoard();
        });
    }

    private handleRoomStateChange = (room: Colyseus.Room) => {

        this.setMatch(`${room.state.playerX?.name} vs ${room.state.playerO?.name}`);
        
        if(!room.state.ready) {
            return;
        }

        if(room.state.winner != "") {

            const iwon = room.state.winner == this.SERVER.SessionID;
            this.setStatus(iwon ? "You Won!" : "You Lost!");
            this.cameras.main.setBackgroundColor(iwon ? '#388E3C' : '#D32F2F');
            this.rematch.setVisible(true);

            //if either player wants a rematch, show the badge
            if(room.state.playerX.offerRematch || room.state.playerO.offerRematch) {
                this.rematchBadge.setVisible(true);
            }

            return;
        }

        if(room.state.currentTurn == this.SERVER.SessionID) {
            console.log("your turn");
            this.setStatus("Your turn");
            this.cameras.main.setBackgroundColor('#4CAF50');
        }
        else {
            console.log("their turn");
            this.setStatus("Their turn");
            this.cameras.main.setBackgroundColor('#F44336');
        }
    };

    private resetBoard = () => {

        console.log("remove markers and reset board");
        this.markers.forEach(m => m.destroy());
        this.markers = [];

        this.board = [
            [' ', ' ', ' '],
            [' ', ' ', ' '],
            [' ', ' ', ' '],
        ];
    }
    
    private isMyTurn = () => {

        return this.SERVER.state.ready && this.SERVER.state.currentTurn == this.SERVER.SessionID && this.SERVER.state.winner == '';
    }

    private drawMarkers = () => {
        console.log('drawing markers')
        //clear markers
        this.markers.forEach(m => m.destroy());
        this.markers = [];

        //redraw all markers
        for(let y=0; y<2; y++) {
            for(let x=0; x<2; x++) {
                if(this.board[y][x] != ' ') {

                    const marker = this.board[y][x]
                    this.board[y][x] = ' ';
                    this.placeMarker(x, y, marker);
                }
            }
        }
    }

    private drawBoard = () => {
        console.log('drawing board');

        const canvas = this.game.canvas;
        const boardSize = Math.min(canvas.width * 0.7, canvas.height * 0.7);
        const tileSize = boardSize/3;

        const width = canvas.width;
        const height = canvas.height;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const boardX = centerX - boardSize / 2;
        const boardY = centerY - boardSize / 2;
        const portrait = this.scale.orientation.toString() == Phaser.Scale.PORTRAIT;
        if(this.match) {
            this.match.destroy();
        }
        const matchTextPos = portrait ? 50 : 20;
        const matchTextSize = portrait ? '15px' : '25px';
        this.match = this.addText(centerX, matchTextPos, 'Red Vs. Blue', matchTextSize, '#FFFFFF');

        if(this.back) {
            this.back.off('pointerdown');
            this.back.destroy();
        }
        this.back = this.addText(40, canvas.height - 20, 'BACK', '20px', '#FFFFFF', this.handleBack);

        if(this.status) {
            this.status.destroy();
        }
        const statusTextPos = portrait ? canvas.height - 50 : canvas.height - 20;
        this.status = this.addText(centerX, statusTextPos, 'waiting for players...', '20px', '#FFFFFF');

        if(this.rematch) {
            this.rematch.off('pointerdown');
            this.rematch.destroy();
        }
        const rematchTextPos = portrait ? canvas.height - 20 : canvas.height - 20;
        this.rematch = this.addText(canvas.width - 100, rematchTextPos, 'REMATCH?', '20px', '#FFFFFF', this.handleRematch);
        this.rematch.setVisible(false);

        if(this.rematchBadge) {
            this.rematchBadge.destroy();
        }
        const rematchBadgePos = portrait ? canvas.height - 23 : canvas.height - 23;
        this.rematchBadge = this.addImage(canvas.width - 25, rematchBadgePos, 'rematch')
        this.rematchBadge.setVisible(false);

        if(this.fullscreen) {
            this.fullscreen.destroy();
            this.fullscreen.off("pointerdown");
        }
        this.fullscreen = this.addImage(this.cameras.main.width-25, 20, 'full-screen', this.toggleFullscreen);
        this.fullscreen.setScale(0.25, 0.25);
        this.fullscreen.setVisible(this.isMobile);
        this.fullscreen.setAlpha(0.4);
        
        //draw actual board
        if(this.boardGraphics) {
            this.boardGraphics.destroy();
        }
        
        this.boardGraphics = this.add.graphics();
        this.boardGraphics.fillStyle(0x000000);
        this.boardGraphics.fillRect(boardX, boardY, boardSize, boardSize);
        this.boardGraphics.lineStyle(6, 0xffffff);

        this.boardGraphics.lineStyle(4, 0xffffff);

        for (let i = 1; i < 3; i++) {
            const y = boardY + i * tileSize;
            this.boardGraphics.moveTo(boardX, y);
            this.boardGraphics.lineTo(boardX + boardSize, y);
        }
    
        // Draw vertical lines
        for (let i = 1; i < 3; i++) {
            const x = boardX + i * tileSize;
            this.boardGraphics.moveTo(x, boardY);
            this.boardGraphics.lineTo(x, boardY + boardSize);
        }

        this.boardGraphics.strokePath();

        this.input.off('pointerdown');
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        
            if(!this.isMyTurn()) {
                return;
            }

            const x = Math.floor((pointer.x - boardX) / tileSize);
            const y = Math.floor((pointer.y - boardY) / tileSize);

            if(x < 0 || x > 2 || y < 0 || y > 3) {
                return;
            }

            console.log(`selecting [${x},${y}]`);
            this.SERVER.send(ClientMessages.MakeMove, { x, y });
        });
    };

    private handleRematch = () => {
        console.log("rematch selected");

        this.SERVER.send(ClientMessages.Rematch);
    };

    private handleBack = () => {
        console.log("going back to lobby");
        
        this.SERVER.leave();

        this.scene.stop('game');
        this.scene.start('lobby');
    };

    private setStatus = (text: string) => {
        this.status.setText(text);
    };

    private setMatch = (text: string) => {
        this.match.setText(text);
    };

    private placeMarker(x: number, y: number, marker: string) {
        console.log(`Placing '${marker}' at (${x}, ${y})`);

        if (x >= 0 && x < 3 && y >= 0 && y < 3 && this.board[y][x] === ' ') {

            this.board[y][x] = marker;
            const canvas = this.game.canvas;
            const boardSize = Math.min(canvas.width * 0.7, canvas.height * 0.7);
            const tileSize = boardSize/3;

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const boardX = centerX - boardSize / 2;
            const boardY = centerY - boardSize / 2;

            const markerX = (x + 0.5) * tileSize + boardX;
            const markerY = (y + 0.5) * tileSize + boardY;

            const markerText = this.add.text(markerX, markerY, marker, {
                fontSize: '50px',
                fontFamily: 'Arial',
                color: '#ffffff',
                align: 'center',
            });

            this.markers.push(markerText);
            markerText.setOrigin(0.5);

            console.log(`Placed '${marker}' at (${x}, ${y})`);
        }
    }
}