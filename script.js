const startButton = document.getElementById("start-button");
const hitButton = document.getElementById("hit-button");
const standButton = document.getElementById("stand-button");
const newGameButton = document.getElementById("new-game-button");
const playerCardsContainer = document.getElementById("player-cards");
const dealerCardsContainer = document.getElementById("dealer-cards");
const playerScoreText = document.getElementById("player-score");
const dealerScoreText = document.getElementById("dealer-score");

let playerHand = [];
let dealerHand = [];
let deck = [];

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

startButton.addEventListener('click', startGame);
hitButton.addEventListener('click', hit);
standButton.addEventListener('click', stand);
newGameButton.addEventListener('click', newGame);

function startGame() {
    playerHand = [];
    dealerHand = [];
    deck = createDeck();
    shuffleDeck(deck);

    dealCards();
    renderGame();

    // blackjack check
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);

    // If the player has blackjack they win and game is over
    if (playerValue === 21) {
        setTimeout(() => {
            alert('Player got a Blackjack! Player wins!');
            endGame();
        }, 400); 
        return; 
    }

    // // If the dealer has blackjack they win and game is over
    if (dealerValue === 21) {
        setTimeout(() => {
            // flip the dealers second card
            dealerCardsContainer.innerHTML = "";
            dealerCardsContainer.innerHTML += `<div class="card"><img src="cards/${dealerHand[0].value}_of_${dealerHand[0].suit}.png" alt="${dealerHand[0].value} of ${dealerHand[0].suit}" class="card-image"></div>`;
            dealerCardsContainer.innerHTML += `<div class="card"><img src="cards/${dealerHand[1].value}_of_${dealerHand[1].suit}.png" alt="${dealerHand[1].value} of ${dealerHand[1].suit}" class="card-image"></div>`;

            const updatedDealerValue = calculateHandValue(dealerHand);
            dealerScoreText.textContent = `Dealer: ${updatedDealerValue}`; 

            alert('Dealer got a Blackjack! Dealer wins!');
            endGame();
        }, 400);
        return;  
    }

    // game is over so remove buttons
    startButton.classList.add("hidden");
    hitButton.classList.remove("hidden");
    standButton.classList.remove("hidden");
}



function createDeck() {
    let newDeck = [];
     // 6 decks
    for (let i = 0; i < 6; i++) {
        for (let suit of suits) {
            for (let value of values) {
                newDeck.push({ value: value, suit: suit });
            }
        }
    }
    return newDeck;
}


function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap
    }
}

function dealCards() {
    // Deal 2 cards each
    playerHand.push(deck.pop(), deck.pop());
    dealerHand.push(deck.pop(), deck.pop());
}

function renderGame(showDealerFull = false) {
    playerCardsContainer.innerHTML = "";
    dealerCardsContainer.innerHTML = "";

    // Render player cards
    playerHand.forEach(card => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");
        const img = document.createElement("img");
        img.src = `cards/${card.value}_of_${card.suit}.png`;
        img.alt = `${card.value} of ${card.suit}`;
        img.classList.add("card-image");
        cardDiv.appendChild(img);
        playerCardsContainer.appendChild(cardDiv);
    });

    // Render dealer cards
    if (showDealerFull) {
        dealerHand.forEach(card => {
            const cardDiv = document.createElement("div");
            cardDiv.classList.add("card");
            const img = document.createElement("img");
            img.src = `cards/${card.value}_of_${card.suit}.png`;
            img.alt = `${card.value} of ${card.suit}`;
            img.classList.add("card-image");
            cardDiv.appendChild(img);
            dealerCardsContainer.appendChild(cardDiv);
        });
        dealerScoreText.textContent = `Dealer: ${calculateHandValue(dealerHand)}`;
    } else {
        // show first card, keep second one face down
        dealerCardsContainer.innerHTML += `<div class="card"><img src="cards/${dealerHand[0].value}_of_${dealerHand[0].suit}.png" alt="${dealerHand[0].value} of ${dealerHand[0].suit}" class="card-image"></div>`;
        dealerCardsContainer.innerHTML += `<div class="card"><img src="cards/back.jpg" alt="card back" class="card-image"></div>`;
        dealerScoreText.textContent = `Dealer: ${dealerHand[0].value}`;
    }

    playerScoreText.textContent = `Player: ${calculateHandValue(playerHand)}`;
}

function calculateHandValue(hand) {
    let value = 0;
    let aceCount = 0;

    hand.forEach(card => {
        if (card.value === 'A') {
            aceCount++;
            value += 11;
        } else if (['K', 'Q', 'J', '10'].includes(card.value)) {
            value += 10;
        } else {
            value += parseInt(card.value);
        }
    });

    while (value > 21 && aceCount > 0) {
        value -= 10;
        aceCount--;
    }

    return value;
}

function hit() {
    const newCard = deck.pop();
    playerHand.push(newCard);

    renderGame();

    const playerValue = calculateHandValue(playerHand);

    if (playerValue > 21) {
        setTimeout(() => {
            alert('Player busted! Dealer wins.');
            hitButton.disabled = true;
            standButton.disabled = true;
            endGame();
        }, 400);
    }
}


function stand() {
    hitButton.disabled = true;
    standButton.disabled = true;

    renderGame(true);
    dealerPlay();
}

async function dealerPlay() {
    let dealerValue = calculateHandValue(dealerHand);

    while (dealerValue < 17) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newCard = deck.pop();
        dealerHand.push(newCard);
        dealerValue = calculateHandValue(dealerHand);
        renderGame(true);
    }
    const playerValue = calculateHandValue(playerHand);
    const result = determineWinner(playerValue, dealerValue);

    setTimeout(() => {
        alert(result);
        endGame();
    }, 400);
}

function determineWinner(playerValue, dealerValue) {
    if (playerValue > 21) {
        return "Player busts! Dealer wins.";
    } else if (dealerValue > 21) {
        return "Dealer busts! Player wins.";
    } else if (playerValue > dealerValue) {
        return "Player wins!";
    } else if (playerValue < dealerValue) {
        return "Dealer wins!";
    } else {
        return "It's a tie!";
    }
}

function endGame() {
    newGameButton.classList.remove("hidden");
}

function newGame() {
    // Reset the game
    hitButton.disabled = false;
    standButton.disabled = false;
    hitButton.classList.add("hidden");
    standButton.classList.add("hidden");
    newGameButton.classList.add("hidden");
    startButton.classList.remove("hidden");

    playerHand = [];
    dealerHand = [];
    deck = [];
}