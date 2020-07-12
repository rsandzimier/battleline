import React from 'react';
import {Card, Formation, Flag} from './BoardComponents'
import canPassTurn from './Game'

export class BattleLineBoard extends React.Component {
  constructor(props) {
    super(props);
    this.selected_card = null;
  }
  onClickCard(player_id, card_id) {
    if (this.props.ctx.currentPlayer !== player_id || this.props.ctx.currentPlayer !== this.props.playerID){
      return;
    }
    if (this.selected_card !== card_id){
      this.selected_card = card_id;
      this.forceUpdate();
    }
    else{
      this.selected_card = null;
      this.forceUpdate();
    }

  }
  onClickSlot(player_id, flag_id) {
    if (this.props.ctx.currentPlayer !== player_id){
      return;
    }
    if (this.selected_card === null){
      return;
    }
    this.props.moves.playCard(this.selected_card, flag_id);
    this.selected_card = null;
  }
  onClickFlag(flag_id){
    this.props.moves.claimFlag(flag_id); 
  }
  onClickDeck(deck_name){
    this.props.moves.drawCard(deck_name); 
  }
  onClickPass(){
    this.props.moves.passTurn();
  }
  render() {
    let tbody = [];

    let cells = [];
    let text_display = '';
    if (this.props.ctx.gameover !== undefined && this.props.ctx.gameover.winner === '0'){
      text_display = 'Winner!'
    }
    else if (this.props.ctx.currentPlayer === '0'){
      text_display = 'Your turn!'
    }
    cells.push(
        <td key ={cells.length} style={{textAlign: 'center'}}>
          {text_display}
        </td>
    );
    for (let i = 0; i < this.props.G.player_hands[0].length; i++) {
      cells.push(
        <td key={cells.length} onClick={() => this.onClickCard('0', i)}>
          <Card str={this.props.G.player_hands[0][i]} side={'top'} selected={i===this.selected_card && this.props.ctx.currentPlayer==='0' && this.props.playerID==='0' && this.props.ctx.numMoves===0}/>
        </td>
      );
    }
    tbody.push(<tr key={tbody.length}>{cells}</tr>);
    cells = [];
    let pass_display = new Array(2).fill('none');
    for (let i = 0; i !== 2; i++){
      if (this.props.ctx.currentPlayer === this.props.playerID && this.props.ctx.currentPlayer === i.toString() && canPassTurn(this.props.G, this.props.ctx)){
        pass_display[i] = 'block';
      }
    }
    cells.push(
      <td rowSpan="3" key={cells.length}>
        <table id="troop_deck" style={{margin:'auto'}}>
          <tbody>
            <tr>
              <td style={{height:'50px'}}>
                <input type="button" value="Pass" style={{margin:'auto',display:pass_display[0]}} onClick={() => this.onClickPass()}/>
              </td>
            </tr>
            <tr>
              <td onClick={() => this.onClickDeck('troop')}>
                <Card str={this.props.G.troop_deck.length>0 ? this.props.G.troop_deck[0]:''}/>
              </td>
            </tr>
            <tr>
              <td style={{height:'50px'}}>
                <input type="button" value="Pass" style={{margin:'auto',display:pass_display[1]}} onClick={() => this.onClickPass()}/>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    );
    for (let i = 0; i < 9; i++) {
      let cards = this.props.G.board_cards[i][0];
      let show_flag = this.props.G.flag_statuses[i]==='0';
      let highlight = cards.length > 0 && cards.slice(-1)[0] === this.props.G.seen_cards.slice(-1)[0] && this.props.playerID !== '0';
      cells.push(
        <td key={cells.length} onClick={() => this.onClickSlot('0', i)}>
          <Formation cards={cards} side={'top'} show_flag={show_flag} highlight={highlight}/>
        </td>
      );
    }
    cells.push(
      <td rowSpan="3" key={cells.length}>
        <table id="tactics_deck" style={{margin:'auto'}}>
          <tbody>
            <tr>
              <td onClick={() => this.onClickDeck('tactics')}>
                <Card str={this.props.G.tactics_deck.length>0 ? this.props.G.tactics_deck[0]:''}/>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    );
    tbody.push(<tr key={tbody.length}>{cells}</tr>);
    cells = [];

    for (let i = 0; i < 9; i++) {
      cells.push(
        <td key={cells.length} onClick={() => this.onClickFlag(i)}>
          <Flag show_flag={this.props.G.flag_statuses[i]===null}/>
        </td>
      );
    }
    tbody.push(<tr key={tbody.length}>{cells}</tr>);
    cells = [];

    for (let i = 0; i < 9; i++) {
      let cards = this.props.G.board_cards[i][1];
      let show_flag = this.props.G.flag_statuses[i]==='1';
      let highlight = cards.length > 0 && cards.slice(-1)[0] === this.props.G.seen_cards.slice(-1)[0] && this.props.playerID !== '1';
      cells.push(
        <td key={cells.length} onClick={() => this.onClickSlot('1',i)}>
          <Formation cards={cards} side={'bottom'} show_flag={show_flag} highlight={highlight}/>
        </td>
      );
    }
    tbody.push(<tr key={tbody.length}>{cells}</tr>);
    cells = [];
    text_display = '';
    if (this.props.ctx.gameover !== undefined && this.props.ctx.gameover.winner === '1'){
      text_display = 'Winner!'
    }
    else if (this.props.ctx.currentPlayer === '1'){
      text_display = 'Your turn!'
    }
    cells.push(
        <td key={cells.length} style={{textAlign: 'center'}}>
          {text_display}
        </td>
    );
    for (let i = 0; i < this.props.G.player_hands[1].length; i++) {
      cells.push(
        <td key={cells.length} onClick={() => this.onClickCard('1',i)}>
          <Card str={this.props.G.player_hands[1][i]} side={'bottom'} selected={i===this.selected_card && this.props.ctx.currentPlayer==='1' && this.props.playerID==='1' && this.props.ctx.numMoves===0}/>
        </td>
      );
    }
    tbody.push(<tr key={tbody.length}>{cells}</tr>);
    return (
      <div>
        <table id="board" style={{margin:"auto"}}>
          <tbody>{tbody}</tbody>
        </table>
      </div>
    );
  }
}