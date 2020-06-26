import React from 'react';

export class BattleLineBoard extends React.Component {
  constructor(props) {
    super(props);
    this.selected_card = null;
  }
  onClickCard(player_id, card_id) {
    if (this.props.ctx.currentPlayer != player_id){
      return;
    }
    this.selected_card = card_id;
  }
  onClickSlot(player_id, flag_id) {
    if (this.props.ctx.currentPlayer != player_id){
      return;
    }
    if (this.selected_card == null){
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
    const cardStyle = {
      border: '1px solid #555',
      whitespace: 'pre-line',
      width: '100px',
      height: '150px',
      lineHeight: '150px',
      textAlign: 'center',
    };

    let tbody = [];

    let cells = [];
    cells.push(
        <td style={cardStyle}>
          {this.props.ctx.currentPlayer == 0 ? 'X': ''}
        </td>
    );
    for (let i = 0; i < this.props.G.player_hands[0].length; i++) {
      let id = i;
      cells.push(
        <td style={cardStyle} key={id} onClick={() => this.onClickCard(0, i)}>
          {this.props.G.player_hands[0][i]}
        </td>
      );
    }
    tbody.push(<tr key={0}>{cells}</tr>);
    cells = [];
    cells.push(
        <td style={cardStyle}>
        </td>
    );
    for (let i = 0; i < 9; i++) {
      let id = 10+i;
      let str = this.props.G.board_cards[i][0].join('\n');
      cells.push(
        <td style={cardStyle} key={id} onClick={() => this.onClickSlot(0, i)}>
          {str}
        </td>
      );
    }
    tbody.push(<tr key={1}>{cells}</tr>);
    cells = [];
    cells.push(
      <td style={cardStyle} key={19} onClick={() => this.onClickDeck(0)}>
        {'Troop'}
      </td>
    );
    for (let i = 0; i < 9; i++) {
      let id = 20+i;
      cells.push(
        <td style={cardStyle} key={id} onClick={() => this.onClickFlag(i)}>
          {this.props.G.flag_statuses[i]}
        </td>
      );
    }
    tbody.push(<tr key={2}>{cells}</tr>);
    cells = [];
    cells.push(
        <td style={cardStyle}>
        </td>
    );
    for (let i = 0; i < 9; i++) {
      let id = 30+i;
      let str = this.props.G.board_cards[i][1].join('\n');
      cells.push(
        <td style={cardStyle} key={id} onClick={() => this.onClickSlot(1,i)}>
          {str}
        </td>
      );
    }
    tbody.push(<tr key={3}>{cells}</tr>);
    cells = [];
    cells.push(
        <td style={cardStyle}> 
          {this.props.ctx.currentPlayer == 1 ? 'X': ''}
        </td>
    );
    for (let i = 0; i < this.props.G.player_hands[1].length; i++) {
      let id = 40+i;
      cells.push(
        <td style={cardStyle} key={id} onClick={() => this.onClickCard(1,i)}>
          {this.props.G.player_hands[1][i]}
        </td>
      );
    }
    tbody.push(<tr key={4}>{cells}</tr>);


    return (
      <div>
        <table id="board">
          <tbody>{tbody}</tbody>
        </table>
      </div>
    );
  }
}