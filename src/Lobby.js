import React from 'react';
import { Lobby } from 'boardgame.io/react';

export class BattleLineLobby extends Lobby{
    handleChangeName(event){
        this.setState({
            playerName: event.target.value,
        });
    }
    handleNewRoom(event){
        this._createRoom('battle-line', 2);
    }
    handleRefreshRooms(event){
        this._updateConnection();
    }
    handleJoinRoom(event, gameID, playerID){
        this._joinRoom('battle-line', gameID, playerID);
    }
    handleLeaveRoom(event, gameID){
        this._leaveRoom('battle-line', gameID);
    }
    handleEnterLobby(event){
        this._enterLobby(this.state.playerName);
    }
    handleExitLobby(event){
        this._exitLobby();
    }
    handleStartGame(event, gameID, playerID){
        this._startGame('battle-line', {numPlayers: 2, gameID: gameID, playerID: playerID});
    }
    handleExitRoom(event){
        this._exitRoom();
    }
    render(){
        var rooms_thead = [];
        var rooms_th = [];

        const room_id_col_style = {
            width:"150px",
            textAlign: 'center',
            padding: '3px'
        }
        const player_name_col_style = {
            width:"150px",
            textAlign: 'center',
            padding: '3px'
        }
        const vs_col_style = {
            width:"30px",
            textAlign: 'center',
            padding: '3px'
        }
        const button_col_style = {
            width:"100px",
            textAlign: 'center',
            padding: '3px'
        }

        rooms_th.push(<th style={room_id_col_style}>{'Room ID'}</th>);
        rooms_th.push(<th style={player_name_col_style}>{'Player 1'}</th>);
        rooms_th.push(<th style={vs_col_style}>{'vs.'}</th>);
        rooms_th.push(<th style={player_name_col_style}>{'Player 2'}</th>);
        rooms_th.push(<th style={button_col_style}><input type="button" value="New Room" onClick={(event) => this.handleNewRoom(event)}/></th>);
        rooms_th.push(<th style={button_col_style}><input type="button" value="Refresh" onClick={(event) => this.handleRefreshRooms(event)}/></th>);
        rooms_thead.push(<tr>{rooms_th}</tr>);

        var rooms_tbody = [];
        for (var i = 0; i !== this.connection.rooms.length; i++){
            var rooms_row = [];
            let room = this.connection.rooms[i];
            var player1_name = (room.players.length > 0) ? room.players[0].name:undefined;
            var player2_name = (room.players.length > 1) ? room.players[1].name:undefined;

            rooms_row.push(<td style={room_id_col_style}>{room.gameID}</td>);
            if (player1_name !== undefined){
                rooms_row.push(<td style={player_name_col_style}>{player1_name}</td>);
            }
            else{
                rooms_row.push(<td style={player_name_col_style}><input type="button" value="Join" onClick={(event) => this.handleJoinRoom(event, room.gameID, 0)}/></td>);
            }
            rooms_row.push(<td style={vs_col_style}>{'vs.'}</td>);
            if (player2_name !== undefined){
                rooms_row.push(<td style={player_name_col_style}>{player2_name}</td>);
            }
            else{
                rooms_row.push(<td style={player_name_col_style}><input type="button" value="Join" onClick={(event) => this.handleJoinRoom(event, room.gameID, 1)}/></td>);
            }    

            if (player1_name === this.state.playerName || player2_name === this.state.playerName){
                rooms_row.push(<td style={button_col_style}><input type="button" value="Leave" onClick={(event) => this.handleLeaveRoom(event, room.gameID)}/></td>);
            }
            else{
                rooms_row.push(<td style={button_col_style}></td>);
            }
            if((player1_name === this.state.playerName && player2_name !== undefined) || (player2_name === this.state.playerName && player1_name !== undefined)){
                let playerID = this.state.playerName === player1_name ? '0':'1';
                rooms_row.push(<td style={button_col_style}><input type="button" value="Play" onClick={(event) => this.handleStartGame(event, room.gameID, playerID)}/></td>);
            }
            else{
                rooms_row.push(<td style={button_col_style}></td>);
            }
            rooms_tbody.push(<tr>{rooms_row}</tr>);
        }

        // var errMsg = this.state.errorMsg !== '' ? 'Error: ' + this.state.errorMsg:'';

        if (this.state.phase === 'enter'){
            return (
                <div>
                    {'Enter name: '}
                    <input type="text" value={this.state.playerName} onChange={(event) => this.handleChangeName(event)}/>
                    <input type="button" value="Enter Lobby" onClick={(event) => this.handleEnterLobby(event)}/>
                </div>
            );
        }
        else if (this.state.phase === 'list'){
            return (
                <div>
                    <input type="button" value="Exit Lobby" onClick={(event) => this.handleExitLobby(event)}/>
                    <br></br>
                    <table id="rooms">
                        <thead>
                            {rooms_thead}
                        </thead>
                        <tbody>
                            {rooms_tbody}
                        </tbody>
                    </table>
                </div>
            );
        }
        else if (this.state.phase === 'play'){
            var board_element = React.createElement(this.state.runningGame.app, {
                gameID: this.state.runningGame.gameID,
                playerID: this.state.runningGame.playerID,
                credentials: this.state.runningGame.credentials
            });
            return (
                <div>
                    {board_element}
                    <br></br>
                    <input type="button" value="Exit Game" onClick={(event) => this.handleExitRoom(event)}/>
                </div>
            );
        }

    }
}