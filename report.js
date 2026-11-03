import { Chess } from "https://esm.sh/chess.js";
const game = new Chess();

game.move("e4");
game.move("c5");

const openingInput = document.querySelector(".opening-search-input");
const suggestions = document.querySelector(".suggestions");
const searchKey = document.querySelector(".opening-search-button");
const openingHeader = document.querySelector(".curr-opening-title");

const openings = [
    "Sicilian Defense",
    "French Defense",
    "Caro-Kann Defense",
    "Queen's Gambit",
    "Ruy Lopez",
    "Italian Game"
];

const params = new URLSearchParams(window.location.search);
const webOpening = params.get("opening");
openingHeader.textContent = webOpening;
console.log(webOpening);

console.log("Hello! Report.js Compiled!");
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