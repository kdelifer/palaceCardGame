// JavaScript File
"use strict"
// Generates a shuffled deck

function getDeck() {
  let CARDS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  let deck =[];
  for (let i=0; i<4; i++) {
    deck.push.apply(deck, CARDS);
  }

  // Shuffle algorithm from StackOverflow
  var currentIndex = deck.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = deck[currentIndex];
    deck[currentIndex] = deck[randomIndex];
    deck[randomIndex] = temporaryValue;
  }

  return deck;
}


// Function to generate a list of players.
// Each player has their own object for their cards (down, up, hand) and they have a fuction to be dealt cards
function getPlayers(players) {
  var playerList = [];
  for(var i =0; i< players; i++) {
      playerList[i] = {
        faceDown:[], 
        faceUp:[], 
        hand:[],
        dealCard: function(card) {
          if (this.faceDown.length < 3) {
            this.faceDown.push(card);
          } else  if (this.faceUp.length < 3) {
            this.faceUp.push(card);
          } else if (this.hand.length < 3){
            this.hand.push(card);
          } else {
            console.error("Too many cards!");
          }
        }
      };
  }
  return playerList;
}

// Function to deal cards to players based on number of players. Takes deck and a list of players with their own arrays as input.
// Uses the dealCard function defined in getPlayers to deal cards 
function deal(deck, playerList) {
  // Loops based on number of players. 9 is the number of cards each player gets.
  for (var i=0; i<(playerList.length*9); i++) {
    var playerId = i%playerList.length;
    playerList[playerId].dealCard(deck[0]);
    deck.splice(0, 1);
  }
}

function logAll() {
  console.log(JSON.stringify(playerList, null, '  '));
  console.log("Play pile: " + playCardPile);
  console.log("Discard pile: " + discardPile);
}



function discardCards(discardPile, playCardPile) {
  while (playCardPile.length > 0) {
    discardPile.push(playCardPile[0]);
    playCardPile.splice(0, 1);
  }
}

function countOccurancesInArray(array, item) {
  var counts = 0;
  array.forEach(function(x) { if (x == item) { counts++; } });
  return counts;
}

function containsFour(array) {
  var counts = [];
  array.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });
  let containsFour = false;
  for (let i=0; i<counts.length; i++) {
    if (counts[i] == 4) {
      containsFour = true;
    }
  }
  return containsFour;
}

// Requires countOccurancesInArray() to be defiend
function playCardFromHand(playerHand, card, playCardPile) {
  var copies = countOccurancesInArray(playerHand, card);
  var numberToPlay = 1;
  for (var i= 0; i<numberToPlay; i++) {
    var index = playerHand.indexOf(card);
    if (index !== -1) {
      playerHand.splice(index, 1);
      playCardPile.push(card);
    } else {console.error(card + " not Found")}
  }
}

function giveCardsToPlayerFromDeck(playerHand, numberOfCards, deck) {
  for (var i=0; i<numberOfCards; i++) {
    if (deck.length > 0) {
      playerHand.push(deck[0]);
      deck.splice(0, 1);
    } else {console.error("Deck is out.")}
  }
}

function pickUpPile(playerHand, playCardPile) {
  while (playCardPile.length > 0) {
    playerHand.push(playCardPile[0]);
    playCardPile.splice(0, 1);
  }
}

function playCardToDiscard(playerHand, card, discardPile) {
  var index = playerHand.indexOf(card);
  if (index !== -1) {
    discardPile.push(card);
    playerHand.splice(index, 1);
  } else {console.error(card + " not Found")}
}


function callFour(player) {
  if (playerList[player].hand.indexOf(4) !== -1) {
    console.log("I call fours!");
  } else {console.error("I don't have a four")}
}

// Not done yet
function playThreeFromHand (playerHand, targetHand) {
  if (playerHand.indexOf(3) !== -1) {
    console.log(indexOf(playerHand) + " flashes " + indexOf(targetHand));
    playCardToDiscard(playerHand, 3);
    if (targetHand.indexOf(3) == -1) {
      pickUpPile(targetHand);
    }
  }
}


module.exports = {
    getDeck: getDeck,
    getPlayers: getPlayers,
    deal: deal,
    playCardFromHand: playCardFromHand,
    playCardToDiscard: playCardToDiscard,
    discardCards: discardCards,
    giveCardsToPlayerFromDeck, giveCardsToPlayerFromDeck,
    pickUpPile: pickUpPile,
    playCardToDiscard: playCardToDiscard,
    containsFour: containsFour,
}
