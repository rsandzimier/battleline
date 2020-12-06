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
    let card = TROOP_DECK_VALUES[i]+TROOP_DECK_COLORS[j];
    DEFAULT_TROOP_DECK.push(card);
  }
}
var DEFAULT_TACTICS_DECK = ["ALX","DAR","CAV","321","TRA","DES","RDP","SCT","FOG","MUD"];

export const BattleLine = {
  name: "battle-line",
  setup: () => {
                let troop_deck = DEFAULT_TROOP_DECK.slice();
                let tactics_deck = DEFAULT_TACTICS_DECK.slice();
                let unseen_cards = DEFAULT_TROOP_DECK.slice();
                let board_cards = new Array(9).fill(new Array(2).fill([]))
                let discards = new Array(2).fill([])
                let seen_cards = [];

                let flag_statuses = new Array(9).fill(null);
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
                  discards: discards,
                  unseen_cards: unseen_cards,
                  seen_cards: seen_cards,
                  flag_statuses: flag_statuses,
                  tactics_played: [0,0],
                  leaders_played: [0,0]
                }},
  minPlayers: 2,
  maxPlayers: 2,
  moves: {
    playCard: (G, ctx, card, flag, displaced_card = null) => {
      if (ctx.numMoves > 0){
        return INVALID_MOVE;
      }
      let card_str = G.player_hands[ctx.currentPlayer][card];
      if (flag !== -1 && (isTroopCard(card_str) || isMoraleTacticsCard(card_str) || isDisplacementCard(card_str))){
        let required_cards = flagHasMud(G.board_cards[flag]) ? 4:3;
        if (countFormationCards(G.board_cards[flag][ctx.currentPlayer]) === required_cards){
          return INVALID_MOVE;
        }
      }
      if (flag !== -1 && G.flag_statuses[flag] !== null){
        return INVALID_MOVE;
      }
      if (isTacticsCard(card_str)){
        if (ctx.currentPlayer === '0' && G.tactics_played[0] > G.tactics_played[1]){
          return INVALID_MOVE;
        }
        if (ctx.currentPlayer === '1' && G.tactics_played[1] > G.tactics_played[0]){
          return INVALID_MOVE;
        }
      }
      if (isLeaderTacticsCard(card_str) && G.leaders_played[ctx.currentPlayer] > 0){
        return INVALID_MOVE;
      }
      if (isDisplacementCard(card_str)){
        if (displaced_card === null){
          return INVALID_MOVE;
        }
        if (G.flag_statuses[displaced_card[0]] !== null){
          return INVALID_MOVE;
        }
        let displaced_card_str = G.board_cards[displaced_card[0]][displaced_card[1]][displaced_card[2]];
        if (card_str === "TRA"){
          if (displaced_card[1] === ctx.currentPlayer || isTacticsCard(displaced_card_str) || flag === -1){
            return INVALID_MOVE;
          }
        }
        else if (card_str === "DES"){
          if (displaced_card[1] === ctx.currentPlayer || !isFormationCard(displaced_card_str) || flag !== -1){
            return INVALID_MOVE;
          }
        }
        else if(card_str === "RDP"){
          if (displaced_card[1] !== ctx.currentPlayer || !isFormationCard(displaced_card_str) || flag === displaced_card[0]){
            return INVALID_MOVE;
          }
        }
      }
      else if (isScoutCard(card_str)){
        if (flag !== -1){
          return INVALID_MOVE;
        }
      }
      else if (flag === -1){
        return INVALID_MOVE;
      }

      if (isDisplacementCard(card_str)){
        let displaced_card_str = G.board_cards[displaced_card[0]][displaced_card[1]][displaced_card[2]];
        G.board_cards[displaced_card[0]][displaced_card[1]].splice(displaced_card[2], 1);
        if (flag !== -1){
          G.board_cards[flag][ctx.currentPlayer].push(displaced_card_str);
        }
        else{
          G.discards[displaced_card[1]].push(displaced_card_str);
        }
        G.discards[ctx.currentPlayer].push(card_str);
      }
      else if (isScoutCard(card_str)){
        G.discards[ctx.currentPlayer].push(card_str);
      }
      else{
        G.board_cards[flag][ctx.currentPlayer].push(card_str); 
      }
      G.seen_cards.push(card_str);
      if (isTacticsCard(card_str)){
        G.tactics_played[ctx.currentPlayer]++;
      }
      if (isLeaderTacticsCard(card_str)){
        G.leaders_played[ctx.currentPlayer]++;
      }
      var ind = G.unseen_cards.indexOf(card_str);
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
        let has_fog = flagHasFog(G.board_cards[flag]);
        let has_mud = flagHasMud(G.board_cards[flag]);
        var formations = getFormations(flag, ctx.currentPlayer, G.board_cards);
        if (!isStrongestFormation(formations[0], formations[1], G.unseen_cards, has_fog, has_mud)){
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
        if (isFormationCard(board_cards[flag][i][j])){
          formation.push(board_cards[flag][i][j]);
        }
      }
      else {
        if (isFormationCard(board_cards[flag][i][j])){
          formation_opp.push(board_cards[flag][i][j]);
        }
      }
    }
  }
  return [formation, formation_opp];
}

function isStrongestFormation(formation, formation_opp, unseen_cards, has_fog, has_mud){
  var formation_strength = formationStrength(formation, has_fog, has_mud);
  var formation_strength_opp = potentialFormationStrength(formation_opp, unseen_cards, has_fog, has_mud);
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

function formationStrength(formation, has_fog, has_mud){
  let required_cards = has_mud ? 4:3;
  if (formation.length !== required_cards){
    return ['incomplete', 0];
  }
  var sum_value = sumValue(formation);
  if (has_fog){
    return ['sum', sum_value];
  }

  var flush_value = flushValue(formation);
  var straight_value = straightValue(formation, has_mud);
  var set_value = setValue(formation);

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
function straightValue(formation, has_mud){
  for (let i = 0; i !== formation.length; i++){
    if (!isTroopCard(formation[i])){
      let vals = TACTICS_VALUE_MAP.get(formation[i]);
      let str_orig = formation[i];
      let highest_value = -1;
      for (let j = 0; j !== vals.length; j++){
        formation[i] = VALUE_MAP_REVERSE.get(vals[j]) + 'x';
        let val = straightValue(formation, has_mud);
        if (val > highest_value){
          highest_value = val;
        }
      }
      formation[i] = str_orig;
      return highest_value;
    }
  }
  return straightValueAux(formation, has_mud);
}

function straightValueAux(formation, has_mud){
  let highest = 0;
  for (let i = 0; i !== formation.length; i++){
    if (VALUE_MAP.get(formation[i][0]) > highest){
      highest = VALUE_MAP.get(formation[i][0]);
    }
    for (let j = i+1; j !== formation.length; j++){
      var diff = Math.abs(VALUE_MAP.get(formation[i][0]) - VALUE_MAP.get(formation[j][0]));
      let max_diff = has_mud ? 3:2;
      if (diff === 0 || diff > max_diff){
        return -1;
      }  
    }
  }
  return formation.length*(2*highest - formation.length + 1)/2;
}

function setValue(formation){
  var values = new Set([1,2,3,4,5,6,7,8,9,10]);
  for (let i = 0; i !== formation.length; i++){
    if (isTroopCard(formation[i])){
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
    if (formation[i].length === 2){
      sum += VALUE_MAP.get(formation[i][0]);
    }
    else{
      sum += TACTICS_VALUE_MAP.get(formation[i])[0];
    }
  }
  return sum;
}

function potentialFormationStrength(formation, unseen_cards, has_fog, has_mud){
  let pot = -1;
  if (!has_fog){
    pot = potentialStraightFlush(formation, unseen_cards, has_mud);
    if (pot !== -1){
      return ['straightflush', pot];
    }
    pot = potentialSet(formation, unseen_cards, has_mud);
    if (pot !== -1){
      return ['set', pot];
    }
    pot = potentialFlush(formation, unseen_cards, has_mud);
    if (pot !== -1){
      return ['flush', pot];
    }
    pot = potentialStraight(formation, unseen_cards, has_mud);
    if (pot !== -1){
      return ['straight', pot];
    }
  }
  pot = potentialSum(formation, unseen_cards, has_mud);
  if (pot !== -1){
    return ['sum', pot];
  }
  return ['incomplete', pot];
}

function potentialStraightFlush(formation, unseen_cards, has_mud, ind = null){
  if (ind === null){
    ind = unseen_cards.length;
  }
  let flush_value = flushValue(formation);
  let straight_value = straightValue(formation, has_mud);

  if (flush_value === -1 || straight_value === -1){
    return -1;
  }
  let required_cards = has_mud ? 4:3;
  if (formation.length === required_cards){
    return straight_value;
  }
  for(let i = ind - 1; i >= 0; i--){
    var formation_new = formation.slice();
    var unseen_cards_new = unseen_cards.slice();
    formation_new.push(unseen_cards[i]);
    unseen_cards_new.splice(i, 1);
    var pot = potentialStraightFlush(formation_new, unseen_cards_new, has_mud, i);
    if (pot !== -1){
      return pot;
    }
  }
  return -1;
}
function potentialSet(formation, unseen_cards, has_mud, ind = null){
  if (ind === null){
    ind = unseen_cards.length;
  }
  let set_value = setValue(formation);

  if (set_value === -1){
    return -1;
  }
  let required_cards = has_mud ? 4:3;
  if (formation.length === required_cards){
      return set_value;
  }
  for(let i = ind - 1; i >= 0; i--){
    var formation_new = formation.slice();
    var unseen_cards_new = unseen_cards.slice();
    formation_new.push(unseen_cards[i]);
    unseen_cards_new.splice(i, 1);
    var pot = potentialSet(formation_new, unseen_cards_new, has_mud, i);
    if (pot !== -1){
      return pot;
    }
  }
  return -1;
}
function potentialFlush(formation, unseen_cards, has_mud, ind = null){
  if (ind === null){
    ind = unseen_cards.length;
  }
  let flush_value = flushValue(formation);
  if (flush_value === -1){
    return -1;
  }
  let required_cards = has_mud ? 4:3;
  if (formation.length === required_cards){
      return flush_value;
  }
  for(let i = ind - 1; i >= 0; i--){
    var formation_new = formation.slice();
    var unseen_cards_new = unseen_cards.slice();
    formation_new.push(unseen_cards[i]);
    unseen_cards_new.splice(i, 1);
    var pot = potentialFlush(formation_new, unseen_cards_new, has_mud, i);
    if (pot !== -1){
      return pot;
    }
  }
  return -1;
}
function potentialStraight(formation, unseen_cards, has_mud, ind = null){
  if (ind === null){
    ind = unseen_cards.length;
  }
  let straight_value = straightValue(formation, has_mud);
  if (straight_value === -1){
    return -1;
  }
  let required_cards = has_mud ? 4:3;
  if (formation.length === required_cards){
      return straight_value;
  }
  for(let i = ind - 1; i >= 0; i--){
    var formation_new = formation.slice();
    var unseen_cards_new = unseen_cards.slice();
    formation_new.push(unseen_cards[i]);
    unseen_cards_new.splice(i, 1);
    var pot = potentialStraight(formation_new, unseen_cards_new, has_mud, i);
    if (pot !== -1){
      return pot;
    }
  }
  return -1;
}
function potentialSum(formation, unseen_cards, has_mud, ind = null){
  if (ind === null){
    ind = unseen_cards.length;
  }
  let sum_value = sumValue(formation);
  let required_cards = has_mud ? 4:3;
  if (formation.length === required_cards){
      return sum_value;
  }
  for(let i = ind - 1; i >= 0; i--){
    var formation_new = formation.slice();
    var unseen_cards_new = unseen_cards.slice();
    formation_new.push(unseen_cards[i]);
    unseen_cards_new.splice(i, 1);
    var pot = potentialSum(formation_new, unseen_cards_new, has_mud, i);
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
                    discards: G.discards,
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
    let required_cards = flagHasMud(board_cards[i]) ? 4:3;
    if (countFormationCards(board_cards[i][player_id]) !== required_cards && flag_statuses[i] === null){
      return true;
    }
  }
  return false;
}

export function canPassTurn(G, ctx){
  if (ctx.numMoves === 0){
    return !canPlayTroopCard(G.board_cards, ctx.currentPlayer, G.flag_statuses, G.player_hands[ctx.currentPlayer]); 
  }
  else{
    return G.troop_deck.length === 0 && G.tactics_deck.length === 0;
  }
}

export function canDisplaceCard(G, ctx, card_str, displaced_card_str, player_id, flag_id){
  if (!isFormationCard(displaced_card_str)){
    return false;
  }
  if (G.flag_statuses[flag_id] !== null){
    return false;
  }
  if (card_str === "TRA" && (player_id === ctx.currentPlayer || isTacticsCard(displaced_card_str))){
    return false;
  }
  if (card_str === "DES" && player_id === ctx.currentPlayer){
    return false;
  }
  if (card_str === "RDP" && player_id !== ctx.currentPlayer){
    return false;
  }
  return true;
} 

function isTroopCard(card){
  return card.length === 2;
}
export function isTacticsCard(card){
  return card.length === 3;
}

function isMoraleTacticsCard(card){
  return ["ALX","DAR","CAV","321"].indexOf(card) >= 0;
}

function isLeaderTacticsCard(card){
  return ["ALX","DAR"].indexOf(card) >= 0;
}

export function isDisplacementCard(card){
  return ["TRA","DES","RDP"].indexOf(card) >= 0;
}

export function isScoutCard(card){
  return ["SCT"].indexOf(card) >= 0;
}

function isFormationCard(card){
  return isTroopCard(card) || isMoraleTacticsCard(card);
}

function countFormationCards(formation){
  let count = 0;
  for (let i = 0; i !== formation.length; i++){
    if (isFormationCard(formation[i])){
      count++;
    }
  }
  return count;
}

function flagHasFog(formations){
  for (let i = 0; i !== 2; i++){
    for (let j = 0; j !== formations[i].length; j++){
      if (formations[i][j] === "FOG"){
        return true;
      }
    }
  }
  return false;
}

function flagHasMud(formations){
  for (let i = 0; i !== 2; i++){
    for (let j = 0; j !== formations[i].length; j++){
      if (formations[i][j] === "MUD"){
        return true;
      }
    }
  }
  return false;
}
