import { INVALID_MOVE } from 'boardgame.io/core';

var DEFAULT_TROOP_DECK = [];
var TROOP_DECK_COLORS = ["r","o","y","g","b","p"];
var TROOP_DECK_VALUES = ["1","2","3","4","5","6","7","8","9","T"];
var VALUE_MAP = new Map([["1",1],["2",2],["3",3],["4",4],["5",5],["6",6],["7",7],["8",8],["9",9],["T",10]]);
var VALUE_MAP_REVERSE = new Map([[1,"1"],[2,"2"],[3,"3"],[4,"4"],[5,"5"],[6,"6"],[7,"7"],[8,"8"],[9,"9"],[10,"T"]]);
var TACTICS_VALUE_MAP = new Map([["ALX", [10,9,8,7,6,5,4,3,2,1]],["DAR", [10,9,8,7,6,5,4,3,2,1]],["CAV", [8]], ["321", [3,2,1]]])
var FORMATION_STRENGTH_MAP = new Map([["straightflush",5],["set",4],["flush",3],["straight",2],["sum",1],["incomplete",0]]);

for(let i = 0; i !== 10; i++){
  for(let j = 0; j !== 6; j++){
    var card = TROOP_DECK_VALUES[i]+TROOP_DECK_COLORS[j];
    DEFAULT_TROOP_DECK.push(card);
  }
}

var troop_deck = DEFAULT_TROOP_DECK.slice();

var DEFAULT_TACTICS_DECK = ["ALX","DAR","CAV","321","TRA","DES","RDP","SCT"];//,"FOG","MUD"];
var tactics_deck = DEFAULT_TACTICS_DECK.slice();

var board_cards = new Array(9).fill(new Array(2).fill([]))
var unseen_cards = DEFAULT_TROOP_DECK.slice();
var seen_cards = [];

var flag_statuses = new Array(9).fill(null);

export const BattleLine = {
  name: "battle-line",
  setup: () => {
                shuffle_array(troop_deck);
                shuffle_array(tactics_deck);
                let player_hands = [];
                player_hands.push([]);
                player_hands.push([]);
                for(let i = 0; i !== 7; i++){
                  for(let j = 0; j !== 2; j++){
                    player_hands[j].push(troop_deck.pop()); 
                  }
                }

                return { troop_deck: troop_deck,
                  tactics_deck: tactics_deck,
                  player_hands: player_hands,
                  board_cards: board_cards,
                  unseen_cards: unseen_cards,
                  seen_cards: seen_cards,
                  flag_statuses: flag_statuses,
                  tactics_played: [0,0],
                  leaders_played: [0,0]
                }},
  minPlayers: 2,
  maxPlayers: 2,
  moves: {
    playCard: (G, ctx, card, flag) => {
      console.log(G);
      if (ctx.numMoves > 0){
        return INVALID_MOVE;
      }
      if (flagHasMud(G.board_cards[flag])){
        if (G.board_cards[flag][ctx.currentPlayer].length === 3){
          return INVALID_MOVE;
        }
      } 
      else{
        if (G.board_cards[flag][ctx.currentPlayer].length === 3){
          return INVALID_MOVE;
        }
      }
      if (G.flag_statuses[flag] !== null){
        return INVALID_MOVE;
      }
      if (G.player_hands[ctx.currentPlayer][card].length === 3){
        if (ctx.currentPlayer === '0' && G.tactics_played[0] > G.tactics_played[1]){
          return INVALID_MOVE;
        }
        if (ctx.currentPlayer === '1' && G.tactics_played[1] > G.tactics_played[0]){
          return INVALID_MOVE;
        }
      }
      if (isLeaderTacticsCard(G.player_hands[ctx.currentPlayer][card]) && G.leaders_played[ctx.currentPlayer] > 0){
        return INVALID_MOVE;
      }
      if (["TRA","DES","RDP","SCT","FOG","MUD"].indexOf(G.player_hands[ctx.currentPlayer][card]) >= 0){
        return INVALID_MOVE;
      }
      G.board_cards[flag][ctx.currentPlayer].push(G.player_hands[ctx.currentPlayer][card]);
      G.seen_cards.push(G.player_hands[ctx.currentPlayer][card]);
      if (G.player_hands[ctx.currentPlayer][card].length === 3){
        G.tactics_played[ctx.currentPlayer]++;
      }
      if (isLeaderTacticsCard(G.player_hands[ctx.currentPlayer][card])){
        G.leaders_played[ctx.currentPlayer]++;
      }
      var ind = G.unseen_cards.indexOf(G.player_hands[ctx.currentPlayer][card]);
      if (ind !== -1){
        G.unseen_cards.splice(ind,1);
      }
      G.player_hands[ctx.currentPlayer].splice(card, 1);
    },
    claimFlag: {
      move: (G, ctx, flag) => {
        if (G.flag_statuses[flag] !== null){
          return INVALID_MOVE;
        }
        var formations = getFormations(flag, ctx.currentPlayer, G.board_cards);
        if (!isStrongestFormation(formations[0], formations[1], G.unseen_cards)){
          return INVALID_MOVE;
        }
        G.flag_statuses[flag] = ctx.currentPlayer;
      },
      noLimit: true
    },
    drawCard: {
      move: (G, ctx, deck) => {
        if (ctx.numMoves === 0){
          return INVALID_MOVE;
        }
        if (deck === 'troop' && G.troop_deck.length === 0){
          return INVALID_MOVE;
        }
        if (deck === 'tactics' && G.tactics_deck.length === 0){
          return INVALID_MOVE;
        }
        if (deck === 'troop'){
          G.player_hands[ctx.currentPlayer].push(G.troop_deck.pop());
        }
        else if (deck === 'tactics'){
          G.player_hands[ctx.currentPlayer].push(G.tactics_deck.pop());
        }
        else{
          return INVALID_MOVE;
        }
        ctx.events.endTurn();
      },
      client: false
    },
    passTurn: (G, ctx) => {
      if (!canPassTurn(G, ctx)){
        return INVALID_MOVE
      }
      ctx.events.endTurn();
    }
  },
  playerView: (G, ctx, playerID) => {return stripSecrets(G, playerID)},

  // },
  endIf: (G, ctx) => {
    if (IsVictory(G.flag_statuses, ctx.currentPlayer)) {
      return { winner: ctx.currentPlayer};
    }
  },
};

// Return true if `cells` is in a winning configuration.
function IsVictory(flag_statuses, player_id) {
  var count = 0;
  var count_consecutive = 0;
  for (let i = 0; i !== 9; i++){
    if (flag_statuses[i] === player_id){
      count++;
      count_consecutive++;
    }
    else{
      count_consecutive = 0;
    }
    if (count >= 5 || count_consecutive >= 3){
      return true;
    }
  }
  return false;
}

function getFormations(flag, player_id, board_cards){
  var formation = [];
  var formation_opp = [];
  for(let i = 0; i !== 2; i++){
    for(let j = 0; j !== board_cards[flag][i].length; j++){
      if(i === parseInt(player_id)){
        formation.push(board_cards[flag][i][j]);
      }
      else {
        formation_opp.push(board_cards[flag][i][j]);
      }
    }
  }
  return [formation, formation_opp];
}

function isStrongestFormation(formation, formation_opp, unseen_cards){
  var formation_strength = formationStrength(formation);
  var formation_strength_opp = potentialFormationStrength(formation_opp, unseen_cards);

  return formationStrengthComparison(formation_strength, formation_strength_opp);
}

function formationStrengthComparison(formation_strength1, formation_strength2){
  if (FORMATION_STRENGTH_MAP.get(formation_strength1[0]) > FORMATION_STRENGTH_MAP.get(formation_strength2[0])){
    return true;
  }
  else if (FORMATION_STRENGTH_MAP.get(formation_strength1[0]) < FORMATION_STRENGTH_MAP.get(formation_strength2[0])){
    return false;
  }
  else if (formation_strength1[1] >= formation_strength2[1]){
    return true;
  }
  else{
    return false;
  }
}

function formationStrength(formation){
  if (formation.length !== 3){
    return ['incomplete', 0];
  }

  var flush_value = flushValue(formation);
  var straight_value = straightValue(formation);
  var set_value = setValue(formation);
  var sum_value = sumValue(formation);

  if (flush_value !== -1 && straight_value !== -1){
    return ['straightflush', straight_value];
  }
  else if (set_value !== -1){
    return ['set', set_value];
  }
  else if (flush_value !== -1){
    return ['flush', flush_value];
  }
  else if (straight_value !== -1){
    return ['straight', straight_value];
  }
  else{
    return ['sum', sum_value];
  }
}

function flushValue(formation){
  let color = null;
  let val = 0;
  for (let i = 0; i !== formation.length; i++){
    if (isTroopCard(formation[i])){
      val += VALUE_MAP.get(formation[i][0]);
      if (color === null){
        color = formation[i][1];
      }
      else if(color !== formation[i][1]){
        return -1;
      }
    }
    else{
      val += TACTICS_VALUE_MAP.get(formation[i])[0];
    }
  }
  return val;
}
function straightValue(formation){
  for (let i = 0; i !== formation.length; i++){
    if (formation[i].length !== 2){
      let vals = TACTICS_VALUE_MAP.get(formation[i]);
      let str_orig = formation[i];
      let highest_value = -1;
      for (let j = 0; j !== vals.length; j++){
        formation[i] = VALUE_MAP_REVERSE.get(vals[j]) + 'x';
        let val = straightValue(formation);
        if (val > highest_value){
          highest_value = val;
        }
      }
      formation[i] = str_orig;
      return highest_value;
    }
  }
  return straightValueAux(formation);
}

function straightValueAux(formation){
  let highest = 0;
  for (let i = 0; i !== formation.length; i++){
    if (VALUE_MAP.get(formation[i][0]) > highest){
      highest = VALUE_MAP.get(formation[i][0]);
    }
    for (let j = i+1; j !== formation.length; j++){
      var diff = Math.abs(VALUE_MAP.get(formation[i][0]) - VALUE_MAP.get(formation[j][0]));
      if (diff === 0 || diff >= 3){
        return -1;
      }  
    }
  }
  return formation.length*(2*highest - formation.length + 1)/2;
}

function setValue(formation){
  var values = new Set([1,2,3,4,5,6,7,8,9,10]);
  for (let i = 0; i !== formation.length; i++){
    if (isTroopCard(formation[i].length)){
      values = setIntersection(values, new Set([VALUE_MAP.get(formation[i][0])]));
    }
    else{
      values = setIntersection(values, new Set(TACTICS_VALUE_MAP.get(formation[i])));
    }
    if (values.size === 0){
      return -1;
    }
  }
  return values.values().next().value*formation.length;
}

function setIntersection(set1, set2){
  return new Set([...set1].filter(x => set2.has(x)));
}

function sumValue(formation){
  var sum = 0;
  for (let i = 0; i !== formation.length; i++){
    if (formation[i].length == 2){
      sum += VALUE_MAP.get(formation[i][0]);
    }
    else{
      sum += TACTICS_VALUE_MAP.get(formation[i])[0];
    }
  }
  return sum;
}

function potentialFormationStrength(formation, unseen_cards){
  let pot = potentialStraightFlush(formation, unseen_cards);
  if (pot !== -1){
    return ['straightflush', pot];
  }
  pot = potentialSet(formation, unseen_cards);
  if (pot !== -1){
    return ['set', pot];
  }
  pot = potentialFlush(formation, unseen_cards);
  if (pot !== -1){
    return ['flush', pot];
  }
  pot = potentialStraight(formation, unseen_cards);
  if (pot !== -1){
    return ['straight', pot];
  }
  pot = potentialSum(formation, unseen_cards);
  if (pot !== -1){
    return ['sum', pot];
  }
  return ['incomplete', pot];
}

function potentialStraightFlush(formation, unseen_cards, ind = null){
  if (ind === null){
    ind = unseen_cards.length;
  }
  let flush_value = flushValue(formation);
  let straight_value = straightValue(formation);

  if (flush_value === -1 || straight_value === -1){
    return -1;
  }
  if (formation.length === 3){
    return straight_value;
  }
  for(let i = ind - 1; i >= 0; i--){
    var formation_new = formation.slice();
    var unseen_cards_new = unseen_cards.slice();
    formation_new.push(unseen_cards[i]);
    unseen_cards_new.splice(i, 1);
    var pot = potentialStraightFlush(formation_new, unseen_cards_new, i);
    if (pot !== -1){
      return pot;
    }
  }
  return -1;
}
function potentialSet(formation, unseen_cards, ind = null){
  if (ind === null){
    ind = unseen_cards.length;
  }
  let set_value = setValue(formation);
  if (set_value === -1){
    return -1;
  }
  if (formation.length === 3){
    return set_value;
  }
  for(let i = ind - 1; i >= 0; i--){
    var formation_new = formation.slice();
    var unseen_cards_new = unseen_cards.slice();
    formation_new.push(unseen_cards[i]);
    unseen_cards_new.splice(i, 1);
    var pot = potentialSet(formation_new, unseen_cards_new, i);
    if (pot !== -1){
      return pot;
    }
  }
  return -1;
}
function potentialFlush(formation, unseen_cards, ind = null){
  if (ind === null){
    ind = unseen_cards.length;
  }
  let flush_value = flushValue(formation);
  if (flush_value === -1){
    return -1;
  }
  if (formation.length === 3){
    return flush_value;
  }
  for(let i = ind - 1; i >= 0; i--){
    var formation_new = formation.slice();
    var unseen_cards_new = unseen_cards.slice();
    formation_new.push(unseen_cards[i]);
    unseen_cards_new.splice(i, 1);
    var pot = potentialFlush(formation_new, unseen_cards_new, i);
    if (pot !== -1){
      return pot;
    }
  }
  return -1;
}
function potentialStraight(formation, unseen_cards, ind = null){
  if (ind === null){
    ind = unseen_cards.length;
  }
  let straight_value = straightValue(formation);
  if (straight_value === -1){
    return -1;
  }
  if (formation.length === 3){
    return straight_value;
  }
  for(let i = ind - 1; i >= 0; i--){
    var formation_new = formation.slice();
    var unseen_cards_new = unseen_cards.slice();
    formation_new.push(unseen_cards[i]);
    unseen_cards_new.splice(i, 1);
    var pot = potentialStraight(formation_new, unseen_cards_new, i);
    if (pot !== -1){
      return pot;
    }
  }
  return -1;
}
function potentialSum(formation, unseen_cards, ind = null){
  if (ind === null){
    ind = unseen_cards.length;
  }
  let sum_value = sumValue(formation);
  if (formation.length === 3){
    return sum_value;
  }
  for(let i = ind - 1; i >= 0; i--){
    var formation_new = formation.slice();
    var unseen_cards_new = unseen_cards.slice();
    formation_new.push(unseen_cards[i]);
    unseen_cards_new.splice(i, 1);
    var pot = potentialSum(formation_new, unseen_cards_new, i);
    if (pot !== -1){
      return pot;
    }
  }
  return -1;
}

function shuffle_array(arr){
  for(let i = arr.length-1; i >= 0; i--){
    var k = Math.floor(Math.random()*(i+1));
    var temp = arr[k];
    arr[k] = arr[i];
    arr[i] = temp;
  }
  return arr;
}

function stripSecrets(G, playerID){
  return G;
  var troop_deck_stripped = new Array(G.troop_deck.length).fill("troop");
  var tactics_deck_stripped = new Array(G.tactics_deck.length).fill("tactics");
  var player_hands_stripped = [];
  for (let i = 0; i !== 2; i++){
    if(parseInt(playerID) === i){
      player_hands_stripped.push(G.player_hands[i]);
    }
    else{
      var opp_hand_stripped = [];
      for (let j = 0; j !== G.player_hands[i].length; j++){
        if (isTroopCard(G.player_hands[i][j]) || G.player_hands[i][j] === 'troop'){
          opp_hand_stripped.push('troop');
        }
        else{
          opp_hand_stripped.push('tactics');
        }
      }
      player_hands_stripped.push(opp_hand_stripped);
    }
  }

  var G_stripped = {troop_deck: troop_deck_stripped,
                    tactics_deck: tactics_deck_stripped,
                    player_hands: player_hands_stripped,
                    board_cards: G.board_cards,
                    unseen_cards: G.unseen_cards,
                    seen_cards: G.seen_cards,
                    flag_statuses: G.flag_statuses,
                    tactics_played: G.tactics_played,
                    leaders_played: G.leaders_played};
  return G_stripped;
}

function canPlayTroopCard(board_cards, player_id, flag_statuses, hand){
  let have_troop_card = false;
  for (let i = 0; i !== hand.length && !have_troop_card; i++){
    if (isTroopCard(hand[i])){
      have_troop_card = true;
    }
  }
  if (!have_troop_card){
    return false;
  }
  for (let i = 0; i !== 9; i++){
    if (board_cards[i][player_id].length !== 3 && flag_statuses[i] === null){
      return true;
    }
  }
  return false;
}

function canPassTurn(G, ctx){
  if (ctx.numMoves === 0){
    return !canPlayTroopCard(G.board_cards, ctx.currentPlayer, G.flag_statuses, G.player_hands[ctx.currentPlayer]); 
  }
  else{
    return G.troop_deck.length === 0;
  }
}

function isTroopCard(card){
  return card.length === 2;
}

function isMoraleTacticsCard(card){
  return ["ALX","DAR","CAV","321"].indexOf(card) >= 0;
}

function isLeaderTacticsCard(card){
  return ["ALX","DAR"].indexOf(card) >= 0;
}

function isFormationCard(card){
  return isTroopCard(card) || isMoraleTacticsCard(card);
}

function countFormationCards(formation){
  let count = 0;
  for (let i = 0; i != formation.length; i++){
    if (isFormationCard(formation[i])){
      count++;
    }
  }
  return count;
}

function flagHasMud(formations){
  for (let i = 0; i != 2; i++){
    for (let j = 0; j != formations[i].length; j++){
      if (formations[i][j] === "MUD"){
        return true;
      }
    }
  }
  return false;
}

function flagHasFog(formations){
  for (let i = 0; i != 2; i++){
    for (let j = 0; j != formations[i].length; j++){
      if (formations[i][j] === "FOG"){
        return true;
      }
    }
  }
  return false;
}
export default canPassTurn;