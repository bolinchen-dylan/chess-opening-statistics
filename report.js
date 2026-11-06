import { Chess } from "https://esm.sh/chess.js";
const game = new Chess();

const openingInput = document.querySelector(".opening-search-input");
const suggestions = document.querySelector(".suggestions");
const searchKey = document.querySelector(".opening-search-button");
const openingHeader = document.querySelector(".curr-opening-title");
const reportBoard = document.querySelector("chess-board");

const response = await fetch("data/openings.json");
const openings = await response.json();

// Init
const params = new URLSearchParams(window.location.search);
const webOpening = params.get("opening");
openingHeader.textContent = webOpening;
console.log(webOpening);

const openingMoves = openings.find(function(o){
    return o.name === webOpening;
});
console.log(openingMoves.uci);
const moves = openingMoves.uci.split(" ");
moves.forEach(function(currMove) {
    game.move({
        from: currMove.slice(0, 2),
        to: currMove.slice(2, 4),
        promotion: currMove[4]
    });
    console.log("moved: " + currMove + "---" + game.fen());

    reportBoard.setPosition(game.fen());
});

// Searching
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
                window.location.href = "report.html?opening=" + encodeURIComponent(o.name);
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
        if (actualInput === "") return;
        const matchingOpening = openings.filter(function(o) {
            const lo = o.name.toLowerCase();
            return lo.includes(actualInput.toLowerCase());
        }).slice(0);
        if (matchingOpening.length !== 0) {
            window.location.href = 
                "report.html?opening=" + encodeURIComponent(matchingOpening[0].name);
        }
    }
});

searchKey.addEventListener("mousedown", function() {
    const actualInput = openingInput.value.trim();
    if (actualInput === "") return;
    const matchingOpening = openings.filter(function(o) {
        const lo = o.name.toLowerCase();
        return lo.includes(actualInput.toLowerCase());
    });
    if (matchingOpening.length !== 0) {
        window.location.href = 
            "report.html?opening=" + encodeURIComponent(matchingOpening[0].name);
    }
});