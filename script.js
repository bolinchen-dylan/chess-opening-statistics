import { Chess } from "https://esm.sh/chess.js";

const game = new Chess();
var moveHistory = game.history();
const chessBoard = document.querySelector("chess-board");
const moveBox = document.querySelector(".move-box");
const backMove = document.querySelector(".backward-move"); 
const nextMove = document.querySelector(".forward-move");

const openingInput = document.querySelector(".opening-search-input");
const suggestions = document.querySelector(".suggestions");
const searchKey = document.querySelector(".opening-search-button");
const openingInfoBox = document.querySelector(".opening-info-box");
const popularOpeningBox = document.querySelector(".popular-linked-opening-box");
const possibleMoveBox = document.querySelector(".possible-move-box");


const response = await fetch("data/openings.json");
const openings = await response.json();

// Searching Bar Implementation

openingInput.addEventListener("input", function() {
    suggestions.replaceChildren();
    suggestions.classList.add("is-open");
    const actualInput = openingInput.value.trim();
    if (actualInput !== ""){
        let matchingOpening = openings.filter(opening => 
            opening.name.toLowerCase().startsWith(actualInput.toLowerCase())
        ).slice(0, 5);
        if (matchingOpening.length === 0){
            matchingOpening = openings.filter(opening => 
                opening.name.toLowerCase().includes(actualInput.toLowerCase())
            ).slice(0, 5);
        }
        matchingOpening.forEach(function(o) { 
            const suggestionOpenings = document.createElement("div");
            suggestionOpenings.textContent = o.name;
            suggestionOpenings.addEventListener("mousedown", function() {
                window.location.href = "report.html?opening=" + encodeURIComponent(o);
            })
            suggestions.append(suggestionOpenings);
        });
    }
});

openingInput.addEventListener("blur", function(){
    suggestions.classList.remove("is-open");
});

openingInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter"){
        const actualInput = openingInput.value.trim();
        const matchingOpening = openings.filter(function(o) {
            const lo = o.toLowerCase();
            return lo.includes(actualInput.toLowerCase());
        }).slice(0);
        if (matchingOpening[0] !== undefined) {
            window.location.href = 
                "report.html?opening=" + encodeURIComponent(matchingOpening[0]);
        }
    }
});

searchKey.addEventListener("mousedown", function() {
    const actualInput = openingInput.value.trim();
    const matchingOpening = openings.filter(function(o) {
        const lo = o.toLowerCase();
        return lo.includes(actualInput.toLowerCase());
    }).slice(0);
    if (matchingOpening[0] !== undefined) {
        window.location.href = 
            "report.html?opening=" + encodeURIComponent(matchingOpening[0]);
    }
});



// Chess Board Moving Implementation

chessBoard.draggablePieces = true;

// 2.1. Check move legal or not.
chessBoard.addEventListener("drop", function(requestMove) {
    try{
        game.move({
            from:requestMove.detail.source,
            to:requestMove.detail.target,
            verbose:true,
            promotion:'q'
        });

        console.log("Legal Move!!!");
        console.log(game.fen());

        showMove();

        console.log("Show move: " + moveHistory);
        console.log("");
        
    }catch(error){
        console.log("Illegal Move!!!");
        console.log("");
        requestMove.detail.setAction("snapback");
    }
});

// The animation update. This prevents a bug of not Queening in a promotion.
chessBoard.addEventListener("snap-end", function() {
    chessBoard.setPosition(game.fen());
});

backMove.addEventListener("mousedown", function(){
    backwardMove();
});

nextMove.addEventListener("mousedown", function(){
    forwardMove();
})

function showMove(){
    while(moveHistory.length > game.history().length - 1){
        // Undo and moves another piece.
        moveHistory.pop();
        moveBox.lastElementChild.remove();
        if(moveHistory.length % 2 === 0){
            // Removed one more time to eliminate the num.
            moveBox.lastElementChild.remove();
        }
    }

    moveHistory = game.history();
    const index = moveHistory.length;

    if(index % 2 === 1){
        const moveNum = (1 + index) / 2;

        const numElement = document.createElement("div");
        numElement.textContent = moveNum + ".";
        moveBox.append(numElement);
        console.log(moveNum + ".");
    }

    const moveElement = document.createElement("div");
    moveElement.textContent = moveHistory[index - 1];
    moveBox.append(moveElement);
    moveBox.scrollTop = moveBox.scrollHeight;

    checkAndShowOpeningFullData(fromSANtoUCI());
}

function backwardMove(){
    if(moveHistory.length > 0){
        game.undo();
        chessBoard.setPosition(game.fen());
        checkAndShowOpeningFullData(fromSANtoUCI());
    }else{
        console.log("This is the first move!!!");
    }
}

function forwardMove(){
    const currMoveIndex = game.history().length;
    if(currMoveIndex < moveHistory.length){
        console.log(moveHistory[currMoveIndex]);
        game.move(moveHistory[currMoveIndex]);
        chessBoard.setPosition(game.fen());
        checkAndShowOpeningFullData(fromSANtoUCI());
    }else{
        console.log("This is the last move!!!");
    }
}

function fromSANtoUCI(){
    const moveNum = game.history().length;
    if(moveNum === 0){
        return "initialPosition";
    }
    const detailedHistory = game.history({ verbose : true });
    var toUCIString = detailedHistory[0].from + detailedHistory[0].to;
    console.log(toUCIString);
    for(let i = 1; i < moveNum; i++){
        toUCIString += "," + detailedHistory[i].from + detailedHistory[i].to;
        if(detailedHistory[i].promotion){
            // Might need to change when introduces import, or just
            // want to add promoting choices.
            toUCIString += "q";
        }
        console.log(toUCIString);
        console.log(detailedHistory);
    }
    return toUCIString;
}

async function checkAndShowOpeningFullData(stringUCI){
    let detailedData = null;
    if(stringUCI === "initialPosition"){
        detailedData = stringUCI;
    }else{
        console.log("try fetch: ")
        console.log("/api/opening?play=" + encodeURIComponent(stringUCI));

        const response = await fetch(
            "/api/opening?play=" + encodeURIComponent(stringUCI)
        );

        console.log("opening check request sent!");

        detailedData = await response.json();
    }
    showOpeningData(detailedData);
    showPopularPossibleOpening(detailedData);
    showPossibleNextMoves(detailedData);
}

function showOpeningData(positionFullData){
    if(positionFullData === "initialPosition"){
        openingInfoBox.textContent = "Curr Opening: Initial Position!!!";
    }else{
        const openingData = positionFullData.opening;
        console.log("Curr Opening: " + openingData.eco + " " + openingData.name);
        openingInfoBox.textContent = "Curr Opening: " + openingData.eco + " " + openingData.name;
    }
}

function showPopularPossibleOpening(positionFullData){
    if(positionFullData === "initialPosition"){
        popularOpeningBox.textContent = "Play a move to see possible openings!!!";
    }else{
        const names = positionFullData.moves.map(move => move.opening?.name);
        const moves = positionFullData.moves.map(move => move.san);
        console.log(names);
        console.log(moves);
        const size = names.length;
        let index = 1;
        
        popularOpeningBox.replaceChildren();
        for(let i = 0; i < size; i++){
            if(names[i] !== undefined){
                const newDiv = document.createElement("div");
                newDiv.textContent = index + ". " + names[i] + "--after: " + moves[i]; 
                popularOpeningBox.appendChild(newDiv);
                index++;
            }
        }
        if(index === 1){
            const newDiv = document.createElement("div");
            newDiv.textContent = "No transposition next move!!!";
            popularOpeningBox.appendChild(newDiv);
        }
    }
}

function showPossibleNextMoves(positionFullData){
    const moves = positionFullData.moves.map(move => move.san);
    const totalGames = positionFullData.moves.map(move => (move.white + move.draws + move.black));
    const whiteRates = positionFullData.moves.map(move => (100 * move.white / (move.white + move.draws + move.black)).toFixed(1));
    const drawRates = positionFullData.moves.map(move => (100 * move.draws / (move.white + move.draws + move.black)).toFixed(1));
    const blackRates = positionFullData.moves.map(move => (100 * move.black / (move.white + move.draws + move.black)).toFixed(1));
    
    const size = moves.length;

    possibleMoveBox.replaceChildren();
    if(size === 0){
        const newDiv = document.createElement("div");
        newDiv.textContent = "No game history in this position!!!";
        possibleMoveBox.appendChild(newDiv);
    }else{
        for(let i = 0; i < size; i++){
        const newDiv = document.createElement("div");
        newDiv.textContent = (i + 1) + ". " + moves[i] + " (" + totalGames[i] + " games) " + 
            whiteRates[i] + "% " + drawRates[i] + "% " + blackRates[i] + "%";
        possibleMoveBox.appendChild(newDiv);
        }
    }
}