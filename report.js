import { Chess } from "https://esm.sh/chess.js";
const game = new Chess();

const openingInput = document.querySelector(".opening-search-input");
const suggestions = document.querySelector(".suggestions");
const searchKey = document.querySelector(".opening-search-button");
const openingHeader = document.querySelector(".curr-opening-title");
const reportBoard = document.querySelector("chess-board");
const openingDescription = document.querySelector(".opening-description");

const response = await fetch("data/openings.json");
const openings = await response.json();

// Init
const params = new URLSearchParams(window.location.search);
const webOpening = params.get("opening");
openingHeader.textContent = webOpening;
console.log(webOpening);

const currOpening = openings.find(function(o){
    return o.name === webOpening;
});
console.log(currOpening.uci);
initPosition(currOpening);


// Find chess opening description --- with wikibook chess opening theory
console.log("this is the raw pgn: " + currOpening.pgn);
const description = await fetchDescription(fromPGNToTitle(currOpening.pgn));
description.forEach(function(p) {
    openingDescription.textContent = openingDescription.textContent + p;
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

function initPosition(currOpening){
    const moves = currOpening.uci.split(" ");
    moves.forEach(function(currMove) {
        game.move({
            from: currMove.slice(0, 2),
            to: currMove.slice(2, 4),
            promotion: currMove[4]
        });
        console.log("moved: " + currMove + "---" + game.fen());
    });
    console.log(game.fen());
    reportBoard.setPosition(game.fen());
}

function fromPGNToTitle(pgn){
    let title = "Chess_Opening_Theory";
    let filteredArray = pgn.split(" ");
    console.log(filteredArray);
    filteredArray = filteredArray.filter(element => !element.includes("."));
    console.log(filteredArray);
    let toMove = true; // w to move.
    let index = 0;
    filteredArray.forEach(function(move){
        if(toMove){
            index++;
            title += "/" + index + "._" + move;
        }else{
            title += "/" + index + "..." + move;
        }
        toMove = !toMove;
    });
    console.log("this is new array: " + title);
    return title;
}

async function fetchDescription(title){
    let successGet = false;
    let data = null;
    let actualFirstParagraphLength = 0;
    let paragraphs = null;
    
    // If fails to get, return to the father opening and grab again.
    while(successGet === false){
        const response = await fetch(
            "/api/description?title=" + title
        );
        data = await response.json();

        if(data.parse !== undefined){
            console.log("this is data.parse.title: " + data.parse.title)
            console.log("this is data.parse: " + data.parse)
            paragraphs = fromHTMLtoParagraph(data);
            actualFirstParagraphLength = paragraphs[0]?.length ?? 0;
            if(actualFirstParagraphLength >= 20){
                successGet = true;
                console.log(data.parse.title + " length: " + actualFirstParagraphLength + " success!!!");
            }else{
                console.log("failed, this description is too short: length=" + actualFirstParagraphLength);
                title = backToFatherOpeningTitle(title);
            }
        }else{
            console.log("failed, this is the curr title:" + data.parse);
            title = backToFatherOpeningTitle(title);
        }
    }

    return paragraphs;
}

function fromHTMLtoParagraph(data){
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.parse.text, "text/html");
    const paragraphs = doc.querySelectorAll("p");

    return Array.from(paragraphs, p => p.textContent.trim());
}

function backToFatherOpeningTitle(title){
    const index = title.lastIndexOf("/");
    title = title.slice(0,index);
    
    return title;
}