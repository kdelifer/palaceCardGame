"use strict";

const express = require('express');
const deck = require('./deck');

const app = express();

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(express.static('public'));

app.get("/", (req, res) => choosePlayerPage(req, res));

app.get("/p", (req, res) => playerPage(req, res));
app.get("/g", (req, res) => gameStart(req, res));

app.get("/play", (req, res) => play(req, res));
app.get("/start", (req, res) => initGame(req, res));
app.get("/swap", (req, res) => swap(req, res));
app.get("/pickUp", (req, res) => pickUp(req, res));

app.listen(8080);

var games = {};
// Creates a new game with a random id, creates playerList, piles.
function init(noPlayers, res) {
	let s = Math.random();
	// "s" is a randomly generated game ID.
	let play = {
		np: noPlayers,
		playerList: deck.getPlayers(noPlayers),
		mixedDeck: deck.getDeck(),
		playCardPile: [],
		discardPile: [],
		lastPersonToPlay: "... jk. No one has played yet ;P"
	};
	games[s]= play;
	deck.deal(play.mixedDeck, play.playerList);
	res.game = {s: s, play:play};
	return s;
}

// Given a session id in the request, retrieves the game 
// info and adds them to the response.
// Every game function should receive s parameter and call getGame
// to retrieve the game information.
function getGame(req, res) {
	let s = req.param("s");
	let play =  games[s];
	res.game = {s: s, play:play};
	console.log(JSON.stringify(res.game));
	return play;
}


// Lists game link, player links.
function gameStart(req, res) {
	res.write("<html><body>");
	getGame(req, res);
	let s = res.game.s;
	let np = res.game.play.np;

	let link = "/g?s=" + s;
	res.write("<h1>Game Link: <a href='" + link + "'>" + link + "</a></h1><hr>");
	for(let i = 0; i < np; i++) {
		res.write("<hr>");
		res.write("<h2><a href='/swap?p=" + i + "&s=" + s + "'>Player " + i + "</a></h2>");
	}
	res.write("</body></html>");
	res.end();	
}


function initGame(req, res) {
	let np = req.param("np");
	if (!np) {
		choosePlayerPage(req, res);
		return;
	}
	let s = init(np, res);
	req.body.s=s;
	gameStart(req, res);
}

// Main page to choose #players in a game.
function choosePlayerPage(req, res) {
	res.write("<html><head><link rel='stylesheet' type='text/css' href='/css/styles.css'></head><body>");
	res.write("<form action='/start' method='get'><select name='np'>" +
	    '<option value="2">2 Players</option>' +
    	'<option value="3">3 Players</option>' +
	    '<option value="4">4 Players</option>' +
		'</select><input type="submit"></form>');
	res.write("</body></html>");
	res.end();
}

// Swap cards page.
function swapCardsPage(req, res) {
	getGame(req, res);
	let p = parseInt(req.param("p"));
	let s = res.game.s;
	let play = res.game.play;
	let myHand = play.playerList[p].hand;
	let myFaceUp = play.playerList[p].faceUp;

	res.write("<html><head><link rel='stylesheet' type='text/css' href='/css/styles.css'></head><body><p>");

	// Your Hand.
	res.write("<table border='1' cellspacing='5px'><tr><font20>Your Hand: </font20>");
	for (let i in myHand) {
		let card = myHand[i];
		res.write("<td><a href='/swap?s=" + s + "&p=" + p + "&card=" + card + "&playDestination=faceUp&action=swap'>" + card + "</a></td>");
	}
	res.write("</tr></table></p>");
	// Your Face Up.
	res.write("<p><font20>Your Face Up Cards: </font20>");
	res.write("<table border='1' cellspacing='5px'><tr>");
	for (let j in myFaceUp) {
		let card = myFaceUp[j];
		res.write("<td><a href='/swap?s=" + s + "&p=" + p + "&card=" + card + "&playDestination=hand&action=swap'>" + card + "</a></td>");   	
	}
	res.write("</tr></table></p><hr><p>")
	if (myHand.length == 3 && myFaceUp.length == 3) {
		res.write("<a href='/p?p=" + p + "&s=" + s + "'>Done Swapping Cards</a>")
	} else {
		res.write("You need 3 in your hand and 3 face up before you can continue.")
	}
	res.write("</p></body></html>");
	res.end()
}

// Lists hand and other important info for player.
// "p" is the player ID. "s" is the game ID.
function playerPage(req, res) {
	getGame(req, res);
	let p = parseInt(req.param("p"));
	let s = res.game.s;
	let play = res.game.play;
	let playDestination = null;
	if (play.playerList[p].hand.length > 0) {
		playDestination = "hand";
	} else if (play.playerList[p].faceUp.length > 0) {
		playDestination = "faceUp";
	} else {
		playDestination = "faceDown";
	}
	let myHand = play.playerList[p].hand;

	res.write("<html><head><link rel='stylesheet' type='text/css' href='/css/styles.css'><meta http-equiv='refresh' content='10'/></head><body>");
	res.write("<h1>Welcome player " + p + "</h1>");
	res.write("<hr>");
	res.write("<p>Game ID: " + s + "</p>")
	res.write("<p>Click <a href='/p?s=" + s + "&p=" + p + "'>here</a> to refresh.</p>");
	res.write("<hr>");

	// Write out one's face down cards.
 	// Seems like it works.
 	if (myHand.length == 0 && play.playerList[p].faceUp.length == 0) {
 		res.write("<table border='1' cellspacing='5px'><tr><font20>Your Face Down Cards: </font20>");
		for (let i in play.playerList[p].faceDown) {
			let card = play.playerList[p].faceDown[i];
			res.write("<td><a href='/play?s=" + s + "&p=" + p + "&card=" + card + "&lastPersonToPlay=" + p + "&playDestination=" + playDestination + "&action=play'>Face Down Card</a></td>");
		}
		res.write("</tr></table>");
 	}

	// Write out your hand.
	res.write("<table border='1' cellspacing='5px'><tr><font20>Your Hand: </font20>");
	for (let i in myHand) {
		let card = myHand[i];
		res.write("<td><a href='/play?s=" + s + "&p=" + p + "&card=" + card + "&lastPersonToPlay=" + p + "&playDestination=" + playDestination + "&action=play'>" + card + "</a></td>");
	}
	res.write("</tr></table>");

	// Write out all the face up cards.
	// It works.
	res.write("<p>");
	for (let z = 0; z < play.playerList.length; z++) {
		let i = (z + p) % play.playerList.length;
		if (i !== p) {
			// Write out how many cards each player has in their hand.
			res.write("<p>There are <important>" + play.playerList[i].hand.length + "</important> cards in the hand of Player " + i +"</p>");
		}
		res.write("<font20>Face Up Cards of Player " + i + "</font20>");
		res.write("<table border='1' cellspacing='5px'><tr>");
		for (let j in (play.playerList[i].faceUp)) {
			let card = play.playerList[i].faceUp[j];
			if (i == p) {
				res.write("<td><a href='/play?s=" + s + "&p=" + p + "&card=" + card + "&lastPersonToPlay=" + p + "&playDestination=" + playDestination + "&action=play'>" + card + "</a></td>");
			} else {
	    			res.write("<td>" + card + "</td>");
			}    	
		}
		res.write("</tr></table>");
		// Write out how many cards each player has face down.
		res.write("<font20>Cards Player " + i + " has face down: <lessImportant>" + play.playerList[i].faceDown.length + "</lessImportant></font20>");
		res.write("</p><hr>");
 	}


 	

 	// Write out the piles.
 	// Array tag is custom.
 	// Important tag is custom.
 	res.write("<p><a href='/pickUp?s=" + s + "&p=" + p + "&lastPersonToPlay=" + p + "&action=pickUp'>Pick Up Pile</a></p>");
 	res.write("<p>Played Cards Pile: <array>" + play.playCardPile + "</array><-New card</p>");
 	res.write("<p>Discard Pile: <array>" + play.discardPile + "</array></p>");
 	res.write("<p>Cards Left in Draw Pile: " + play.mixedDeck.length + "</p>");
 	res.write("<p>Last Person to Play Was <important>Player " + play.lastPersonToPlay + "<important></p>")

 	// Ending stuff.
	res.write("</body></html>");
	res.end();
}

function swap(req, res) {
	getGame(req, res);
	let s = res.game.s;
	let play = res.game.play;
	let p = req.param("p");
	let card = req.param("card");
	let action = req.param("action");
	let playDestination = req.param("playDestination");
	let myHand = play.playerList[p].hand;
	let myFaceUp = play.playerList[p].faceUp;

	if (playDestination == "hand") {
		deck.playCardFromHand(myFaceUp, card, myHand);
	} else {
		deck.playCardFromHand(myHand, card, myFaceUp);
	}

	swapCardsPage(req, res);
}

function play(req, res) {
	getGame(req, res);
	let s = res.game.s;
	let play = res.game.play;
	let p = req.param("p");
	let card = req.param("card");
	let action = req.param("action");
	let playDestination = req.param("playDestination");
	play.lastPersonToPlay = req.param("lastPersonToPlay") + ". Action = " + action;

	// Performe game logic here.
	let myCards = null;
	if (playDestination == "hand") {
		myCards = play.playerList[p].hand;
	}else if (playDestination == "faceUp") {
		myCards = play.playerList[p].faceUp;
	} else {
		myCards = play.playerList[p].faceDown;
	}

	for (let i in myCards) {
		let c = myCards[i];
		console.log("c = " + c + ", i = " + i);
		if (c == card) {
			if (myCards.length < 4 && playDestination == "hand") {
				deck.giveCardsToPlayerFromDeck(myCards, 1, play.mixedDeck);
			}
			if (c == 3) {
				deck.playCardToDiscard(myCards, card, play.discardPile);
			} else {
				deck.playCardFromHand(myCards, card, play.playCardPile);
			}
			break;
		}
	}
	
	if (play.playCardPile[play.playCardPile.length -1 ] == 10 || deck.containsFour(play.playCardPile)) {
		deck.discardCards(play.discardPile, play.playCardPile);
	}

	// Code for flashing with a three.
	if (play.playCardPile[play.playCardPile.length -1 ] == 3) {
		res.write("<script>var target = prompt('Who do you flash?');</script>");
		res.write("<important>Player " + p + " Flashes Player " + target + "</important>");
	}

	playerPage(req, res);
}


function pickUp(req, res) {
	getGame(req, res);
	let s = res.game.s;
	let play = res.game.play;
	let p = req.param("p");
	let card = req.param("card");
	let action = req.param("action");
	play.lastPersonToPlay = req.param("lastPersonToPlay") + ". Action = " + action;

	let myHand = play.playerList[p].hand;
	deck.pickUpPile(myHand, play.playCardPile);


	playerPage(req, res);
}

// NOTE: Playing Face Up Cards Doesn't Work Yet!!!

