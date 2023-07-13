class AudioController {
  constructor() {
    this.bgMusic = new Audio("Assets/Audio/creepy.mp3");
    this.flipSound = new Audio("Assets/Audio/flip.wav");
    this.matchSound = new Audio("Assets/Audio/match.wav");
    this.victorySound = new Audio("Assets/Audio/victory.wav");
    this.gameOverSound = new Audio("Assets/Audio/gameover.wav");
    this.bgMusic.volume = 0.5;
    this.bgMusic.loop = true;
  }

  startMusic() {
    this.bgMusic.play();
  }
  stopMusic() {
    this.bgMusic.pause();
    this.bgMusic.currentTime = 0;
  }
  flip() {
    this.flipSound.play();
  }
  match() {
    this.matchSound.play();
  }
  victory() {
    this.stopMusic();
    this.victorySound.play();
  }
  gameOver() {
    this.stopMusic();
    this.gameOverSound.play();
  }
}

class MixorMatch {

  constructor(totalTime, cards) {
    this.ispaused = false;
    this.isstop = false;
    this.cardsArray = cards;
    this.totalTime = totalTime;
    this.timeRemaining = totalTime;
    this.timer = document.getElementById("time-remaining");
    this.ticker = document.getElementById("flips");
    this.audioController = new AudioController();
  }

  startGame() {

    this.ispaused = false;
    this.isstop = false;
    this.cardToCheck = null;
    this.totalClicks = 0;
    this.timeRemaining = this.totalTime;
    this.matchedCards = [];
    this.busy = true; // busy true means you cant click any random card to flip

    setTimeout(() => {
      this.audioController.startMusic();
      this.shuffleCards();
      this.countDown = this.startCountDown();
      this.busy = false;
    }, 500);
    this.hideCards();
    this.timer.innerText = this.timeRemaining;
    this.ticker.innerText = this.totalClicks;
    // function func(){
    //     console.log(this.ispaused);
    //   if (this.ispaused) {
    //     this.resumeGame();
    //     p.innerText = "Pause";
    //   } else {
    //     p.innerText = "Resume";
    //     this.pauseGame();
    //   }
    // }
    var p = document.getElementsByClassName("pause")[0];

    p.addEventListener("click", ()=>{

      if (this.ispaused) {
        this.resumeGame();
        this.busy = false;
        p.innerText = "Pause";
      } else {
        this.busy = true;
        p.innerText = "Resume";
        this.pauseGame();
      }

    },false);

    var q = document.getElementsByClassName("sound")[0];
    q.addEventListener("click", () => {
      if (this.isstop) {
        this.isstop = false;
        q.innerText = "Sound OFF";
        this.audioController.startMusic();
      } else {
        this.isstop = true;
        q.innerText = "Sound ON";
        this.audioController.stopMusic();
      }
    });
  }
  hideCards() {
    this.cardsArray.forEach((card) => {
      card.classList.remove("visible");
      card.classList.remove("matched");
    });
  }
  flipCard(card) {
    if (this.canFlipCard(card)) {
      this.audioController.flip();
      this.totalClicks++;
      this.ticker.innerText = this.totalClicks;
      card.classList.add("visible");
      /*not for first time*/
      if (this.cardToCheck) {
        this.checkForCardMatch(card);
      } else {
        this.cardToCheck = card;
      }
    }
  }

  checkForCardMatch(card) {
    if (this.getCardType(card) === this.getCardType(this.cardToCheck)) {
      this.cardMatch(card, this.cardToCheck);
    } else {
      this.cardMisMatch(card, this.cardToCheck);
    }
    this.cardToCheck = null;
  }

  cardMatch(card1, card2) {
    this.matchedCards.push(card1);
    this.matchedCards.push(card2);
    card1.classList.add("matched");
    card2.classList.add("matched");
    this.audioController.match();

    if (this.matchedCards.length === this.cardsArray.length) {
      this.victory();
    }
  }
  cardMisMatch(card1, card2) {
    this.busy = true;
    setTimeout(() => {
      card1.classList.remove("visible");
      card2.classList.remove("visible");
      this.busy = false;
    }, 1000);

  }

  getCardType(card) {
    return card.getElementsByClassName("card-value")[0].src;
  }

  startCountDown() {
    return setInterval(() => {
      this.timeRemaining--;
      this.timer.innerText = this.timeRemaining;

      if (this.timeRemaining === 0) {
        this.gameOver();
      }
    }, 1000);

  }

  gameOver() {
    clearInterval(this.countDown);

    this.audioController.gameOver();
    document.getElementById("game-over-text").classList.add("visible");
    this.hideCards();
  }

  victory() {
    clearInterval(this.countDown);

    this.audioController.victory();
    document.getElementById("victory-text").classList.add("visible");
    this.hideCards();
  }

  /* css grid order property shuffle order of cards */
  shuffleCards() {
    for (let i = this.cardsArray.length - 1; i > 0; i--) {
      let randIndex = Math.floor(Math.random() * (i + 1));
      this.cardsArray[randIndex].style.order = i;
      this.cardsArray[i].style.order = randIndex;
    }
  }
  canFlipCard(card) {
    // card not busy i.e. not flipped already , not an already matched card , card is not equal to card to check only
    return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
  }

  resumeGame() {
    this.ispaused = false;
    this.countDown = this.startCountDown();
    this.audioController.startMusic();
  }

  pauseGame() {

    this.ispaused = true;
    clearInterval(this.countDown);
    this.audioController.stopMusic();
  }
}

function ready(time) {
  let overlays = Array.from(document.getElementsByClassName("overlay-text"));
  let cards = Array.from(document.getElementsByClassName("card"));
  let game = new MixorMatch(time, cards);

  overlays.forEach((overlay) => {
    overlay.addEventListener("click", () => {
      overlay.classList.remove("visible");
      game.startGame();
    });
  });
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      game.flipCard(card);
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ready(100));
} else {
  ready(100);
}
