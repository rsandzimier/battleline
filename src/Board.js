import React from 'react';
import {Card, Formation, Flag} from './BoardComponents'

export class BattleLineBoard extends React.Component {
  constructor(props) {
    super(props);
    this.selected_card = null;
  }
  onClickCard(player_id, card_id) {
    if (this.props.ctx.currentPlayer !== player_id){
      return;
    }
    this.selected_card = card_id;
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
  onClickDeck(deck_id){
    this.props.moves.drawCard(deck_id); 
  }
  render() {
    let tbody = [];

    let cells = [];
    cells.push(
        <td key ={cells.length}>
          {this.props.ctx.currentPlayer === '0' ? 'X': ''}
        </td>
    );
    for (let i = 0; i < this.props.G.player_hands[0].length; i++) {
      cells.push(
        <td key={cells.length} style={{border: "1px solid black"}} onClick={() => this.onClickCard('0', i)}>
          <Card str={this.props.G.player_hands[0][i]}/>
        </td>
      );
    }
    tbody.push(<tr key={tbody.length}>{cells}</tr>);
    cells = [];
    cells.push(
      <td rowSpan="3" key={cells.length} style={{border: "1px solid red"}}>
        <table id="troop_deck" style={{margin:'auto'}}>
          <tbody>
            <tr>
              <td style={{border: "1px solid black"}} onClick={() => this.onClickDeck(0)}>
                <Card str={this.props.G.troop_deck[0]}/>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    );
    for (let i = 0; i < 9; i++) {
      let str = this.props.G.board_cards[i][0].join('\n');
      cells.push(
        <td key={cells.length} style={{border: "1px solid black"}} onClick={() => this.onClickSlot('0', i)}>
          <Formation cards={this.props.G.board_cards[i][0]} side={'top'}/>
        </td>
      );
    }
    tbody.push(<tr key={tbody.length}>{cells}</tr>);
    cells = [];

    for (let i = 0; i < 9; i++) {
      cells.push(
        <td key={cells.length} onClick={() => this.onClickFlag(i)} style={{height:"50px"}}>
          <Flag flag_status={this.props.G.flag_statuses[i]}/>
        </td>
      );
    }
    tbody.push(<tr key={tbody.length}>{cells}</tr>);
    cells = [];

    for (let i = 0; i < 9; i++) {
      let str = this.props.G.board_cards[i][1].join('\n');
      cells.push(
        <td key={cells.length} style={{border: "1px solid black"}} onClick={() => this.onClickSlot('1',i)}>
          <Formation cards={this.props.G.board_cards[i][1]} side={'bottom'}/>
        </td>
      );
    }
    tbody.push(<tr key={tbody.length}>{cells}</tr>);
    cells = [];
    cells.push(
        <td key={cells.length}>
          {this.props.ctx.currentPlayer === '1' ? 'X': ''}
        </td>
    );
    for (let i = 0; i < this.props.G.player_hands[1].length; i++) {
      cells.push(
        <td key={cells.length} style={{border: "1px solid black"}} onClick={() => this.onClickCard('1',i)}>
          <Card str={this.props.G.player_hands[1][i]}/>
        </td>
      );
    }
    tbody.push(<tr key={tbody.length}>{cells}</tr>);
    return (
      <div>
        <table id="board">
          <tbody>{tbody}</tbody>
        </table>
        <img src="/flag.png"/>
      </div>
    );
  }
}