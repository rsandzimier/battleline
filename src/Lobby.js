import React from 'react';
import { Lobby } from 'boardgame.io/react';

export class BattleLineLobby extends Lobby{
    handleChangeName(event){
        this.setState({
            playerName: event.target.value,
        });
    }
    handleNewMatch(event){
        console.log("New match");
        this._createMatch('battle-line', 2);
    }
    handleRefreshMatches(event){
        console.log("Refresh matches");
        this._updateConnection();
    }
    handleJoinMatch(event, matchID, playerID){
        console.log("Join match");
        console.log(matchID);
        console.log(playerID);
        this._joinMatch('battle-line', matchID, playerID);
        console.log(this.state);
    }
    handleLeaveMatch(event, matchID){
        console.log("Leave match");
        this._leaveMatch('battle-line', matchID);
    }
    handleEnterLobby(event){
        console.log("Enter lobby");
        this._enterLobby(this.state.playerName);
    }
    handleExitLobby(event){
        console.log("Exit lobby");
        this._exitLobby();
    }
    handleStartMatch(event, matchID, playerID){
        console.log("Start match");
        this._startMatch('battle-line', {numPlayers: 2, matchID: matchID, playerID: playerID});
    }
    handleExitMatch(event){
        console.log("Exit match")
        this._exitMatch();
    }
    render(){
        var matches_thead = [];
        var matches_th = [];

        const match_id_col_style = {
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

        matches_th.push(<th style={match_id_col_style}>{'Match ID'}</th>);
        matches_th.push(<th style={player_name_col_style}>{'Player 1'}</th>);
        matches_th.push(<th style={vs_col_style}>{'vs.'}</th>);
        matches_th.push(<th style={player_name_col_style}>{'Player 2'}</th>);
        matches_th.push(<th style={button_col_style}><input type="button" value="New Match" onClick={(event) => this.handleNewMatch(event)}/></th>);
        matches_th.push(<th style={button_col_style}><input type="button" value="Refresh" onClick={(event) => this.handleRefreshMatches(event)}/></th>);
        matches_thead.push(<tr>{matches_th}</tr>);

        var matches_tbody = [];
        console.log("Loop through matches");
        for (var i = 0; i !== this.connection.matches.length; i++){
            var matches_row = [];
            let match = this.connection.matches[i];
            console.log(match);
            var player1_name = (match.players.length > 0) ? match.players[0].name:undefined;
            var player2_name = (match.players.length > 1) ? match.players[1].name:undefined;
            console.log(player1_name);
            console.log(player2_name);

            matches_row.push(<td style={match_id_col_style}>{match.matchID}</td>);
            if (player1_name !== undefined){
                matches_row.push(<td style={player_name_col_style}>{player1_name}</td>);
            }
            else{
                matches_row.push(<td style={player_name_col_style}><input type="button" value="Join" onClick={(event) => this.handleJoinMatch(event, match.matchID, 0)}/></td>);
            }
            matches_row.push(<td style={vs_col_style}>{'vs.'}</td>);
            if (player2_name !== undefined){
                matches_row.push(<td style={player_name_col_style}>{player2_name}</td>);
            }
            else{
                matches_row.push(<td style={player_name_col_style}><input type="button" value="Join" onClick={(event) => this.handleJoinMatch(event, match.matchID, 1)}/></td>);
            }    

            if (player1_name === this.state.playerName || player2_name === this.state.playerName){
                matches_row.push(<td style={button_col_style}><input type="button" value="Leave" onClick={(event) => this.handleLeaveMatch(event, match.matchID)}/></td>);
            }
            else{
                matches_row.push(<td style={button_col_style}></td>);
            }
            if((player1_name === this.state.playerName && player2_name !== undefined) || (player2_name === this.state.playerName && player1_name !== undefined)){
                let playerID = this.state.playerName === player1_name ? '0':'1';
                matches_row.push(<td style={button_col_style}><input type="button" value="Play" onClick={(event) => this.handleStartMatch(event, match.matchID, playerID)}/></td>);
            }
            else{
                matches_row.push(<td style={button_col_style}></td>);
            }
            matches_tbody.push(<tr>{matches_row}</tr>);
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
                    <table id="matches">
                        <thead>
                            {matches_thead}
                        </thead>
                        <tbody>
                            {matches_tbody}
                        </tbody>
                    </table>
                </div>
            );
        }
        else if (this.state.phase === 'play'){
            var board_element = React.createElement(this.state.runningMatch.app, {
                matchID: this.state.runningMatch.matchID,
                playerID: this.state.runningMatch.playerID,
                credentials: this.state.runningMatch.credentials
            });
            return (
                <div>
                    {board_element}
                </div>
            );
        }

    }
}