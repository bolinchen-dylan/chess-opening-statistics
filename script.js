import { Chess } from "https://esm.sh/chess.js";

const game = new Chess();
var moveHistory = game.history();
var shownMoveNum = 0;
const chessBoard = document.querySelector("chess-board");
const moveBox = document.querySelector(".move-box");
const backMove = document.querySelector(".backward-move"); 
const nextMove = document.querySelector(".forward-move");

const openingInput = document.querySelector(".opening-search-input");
const suggestions = document.querySelector(".suggestions");
const searchKey = document.querySelector(".opening-search-button");


const openings = [
    "Sicilian Defense",
    "French Defense",
    "Caro-Kann Defense",
    "Queen's Gambit",
    "Ruy Lopez",
    "Italian Game"
];

// Searching Bar Implementation

openingInput.addEventListener("input", function() {
    suggestions.replaceChildren();
    suggestions.classList.add("is-open");
    const actualInput = openingInput.value.trim();
    if (actualInput !== ""){
        const matchingOpening = openings.filter(function(o) {
            const lo = o.toLowerCase();
            return lo.includes(actualInput.toLowerCase());
        }).slice(0, 5);
        matchingOpening.forEach(function(o) { 
            const suggestionOpenings = document.createElement("div");
            suggestionOpenings.textContent = o;
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
}

function backwardMove(){
    if(moveHistory.length > 0){
        game.undo();
        chessBoard.setPosition(game.fen());
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
    }else{
        console.log("This is the last move!!!");
    }
}