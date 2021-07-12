import React from 'react';
import {Card, Formation, Flag} from './BoardComponents'
import {canPassTurn, isDisplacementCard, isScoutCard, canDisplaceCard, isTroopCard, isTacticsCard} from './Game'

export class BattleLineBoard extends React.Component {
  constructor(props) {
    super(props);
    this.selected_card = null;
    this.displaced_card = null;
  }
  onClickCard(player_id, card_id) {
    if (this.props.ctx.currentPlayer !== player_id || this.props.ctx.currentPlayer !== this.props.playerID){
      return;
    }
    if (this.selected_card !== card_id){
      this.selected_card = card_id;
      this.displaced_card = null;
      this.forceUpdate();
    }
    else{
      this.selected_card = null;
      this.displaced_card = null;
      this.forceUpdate();
    }
  }
  onClickSlot(player_id, flag_id, event) {
    if (this.selected_card === null){
      return;
    }
    let card_str = this.props.G.player_hands[this.props.ctx.currentPlayer][this.selected_card];
    if (isDisplacementCard(card_str) && flag_id !== -1){
      let rect = event.target.getBoundingClientRect();
      let y_offset = player_id === '0' ? rect.bottom - event.clientY : event.clientY - rect.top;
      let n_cards = this.props.G.board_cards[flag_id][player_id].length;

      let boundary_y = 0;
      for (let i = 0; i !== n_cards; i++){
        let incr_y = (i !== n_cards - 1) ? 35:120;
        boundary_y += incr_y;
        if (y_offset < boundary_y){
          let displaced_card_str = this.props.G.board_cards[flag_id][player_id][i];
          if(canDisplaceCard(this.props.G, this.props.ctx, card_str, displaced_card_str, player_id, flag_id)){
            let new_displaced_card = [flag_id, player_id, i];
            if (this.displaced_card === null){
              this.displaced_card = new_displaced_card;
              this.forceUpdate();
              return;
            }
            else if (arraysEqual(this.displaced_card, new_displaced_card)){
              this.displaced_card = null;
              this.forceUpdate();
              return;
            }
            else{
              break;
            }
          }
          break;
        }
      }
    }
    if (isDisplacementCard(card_str)){
      if (this.props.ctx.currentPlayer !== player_id && card_str !== "DES"){
        return;
      }
      if (this.displaced_card === null){
        return;
      }
      this.props.moves.playCard(this.selected_card, flag_id, this.displaced_card);
      this.selected_card = null;
      this.displaced_card = null;
      this.forceUpdate();
    }
    else if (isScoutCard(card_str)){
      if (flag_id === -1){
        this.props.moves.playCard(this.selected_card, flag_id);
        this.selected_card = null;
        this.displaced_card = null;
        this.forceUpdate();
      }
      else{
        return;
      }
    }
    else{
      if (this.props.ctx.currentPlayer !== player_id){
        return;
      }
      if (flag_id === -1){
        return;
      }
      this.props.moves.playCard(this.selected_card, flag_id);
      this.selected_card = null;
      this.displaced_card = null;
      this.forceUpdate();
    }
  }
  onClickFlag(flag_id){
    this.props.moves.claimFlag(flag_id);
  }
  onClickDeck(deck_name){
    if (this.selected_card !== null){
      let card_str = this.props.G.player_hands[this.props.ctx.currentPlayer][this.selected_card];
      if (isScoutCard(card_str)){
        this.props.moves.playCard(this.selected_card, -1);
        this.selected_card = null;
        this.displaced_card = null;
        this.forceUpdate();
      }
      else if ((isTroopCard(card_str) && deck_name == "troop") || (isTacticsCard(card_str) && deck_name == "tactics")){
        this.props.moves.playCard(this.selected_card, -1);
        this.selected_card = null;
        this.displaced_card = null;
        this.forceUpdate();
      }
    }
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
    for (let i = 0; i !== 9 - this.props.G.player_hands[0].length; i++){
      cells.push(
        <td key={cells.length}></td>
      );
    }
    let highlights = [new Array(this.props.G.discards[0].length).fill(null), new Array(this.props.G.discards[1].length).fill(null)];
    if (this.props.G.discards[0].length > 0 && this.props.G.discards[0].slice(-1)[0] === this.props.G.seen_cards.slice(-1)[0] && this.props.playerID !== '0'){
      highlights[0][this.props.G.discards[0].length-1] = "#000000";
    }
    if (this.props.G.discards[1].length > 0 && this.props.G.discards[1].slice(-1)[0] === this.props.G.seen_cards.slice(-1)[0] && this.props.playerID !== '1'){
      highlights[1][this.props.G.discards[1].length-1] = "#000000";
    }
    cells.push(
      <td rowSpan="5" key={cells.length}>
        <table id="tactics_deck" style={{margin:'auto'}}>
          <tbody>
            <tr>
              <td onClick={(event) => this.onClickSlot('0',-1,event)}>
                <Formation cards={this.props.G.discards[0]} side={'top'} show_flag={false} highlights={highlights[0]}/>
              </td>
            </tr>
            <tr>
              <td onClick={() => this.onClickDeck('tactics')}>
                <Card str={this.props.G.tactics_deck.length>0 ? this.props.G.tactics_deck[0]:''} side={'deck'}/>
              </td>
            </tr>
            <tr>
              <td onClick={(event) => this.onClickSlot('1',-1,event)}>
                <Formation cards={this.props.G.discards[1]} side={'bottom'} show_flag={false} highlights={highlights[1]}/>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    );
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
              <td style={{height:'120px'}} onClick={() => this.onClickDeck('troop')}>
                <Card str={this.props.G.troop_deck.length>0 ? this.props.G.troop_deck[0]:''} side={'deck'}/>
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
      let highlights = new Array(cards.length).fill(null);
      let last_played = cards.length > 0 && cards.slice(-1)[0] === this.props.G.seen_cards.slice(-1)[0] && this.props.playerID !== '0';
      if (last_played){
        highlights[cards.length-1] = "#000000";
      }
      if (this.displaced_card !== null && this.displaced_card[0] === i && this.displaced_card[1] === '0'){
        highlights[this.displaced_card[2]] = "#AAAAAA";
      }
      cells.push(
        <td key={cells.length} onClick={(event) => this.onClickSlot('0', i, event)}>
          <Formation cards={cards} side={'top'} show_flag={show_flag} highlights={highlights}/>
        </td>
      );
    }

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
      let highlights = new Array(cards.length).fill(null);
      let last_played = cards.length > 0 && cards.slice(-1)[0] === this.props.G.seen_cards.slice(-1)[0] && this.props.playerID !== '1';
      if (last_played){
        highlights[cards.length-1] = "#000000";
      } 
      if (this.displaced_card !== null && this.displaced_card[0] === i && this.displaced_card[1] === '1'){
        highlights[this.displaced_card[2]] = "#AAAAAA";
      }
      cells.push(
        <td key={cells.length} onClick={(event) => this.onClickSlot('1',i,event)}>
          <Formation cards={cards} side={'bottom'} show_flag={show_flag} highlights={highlights}/>
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

function arraysEqual(arr1, arr2){
  if (arr1 === null && arr2 === null){
    return true;
  }
  if (arr1 === null || arr2 === null){
    return false;
  }
  if (arr1.length !== arr2.length){
    return false;
  }
  for (let i = 0; i !== arr1.length; i++){
    if (arr1[i] !== arr2[i]){
      return false;
    }
  }
  return true;
}