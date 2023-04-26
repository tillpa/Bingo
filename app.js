const debugging = false;

const AppController = (function () {
  const date = new Date();
  const data = [];
  let currentNumber = 0;
  const currentNumbers = [];
  const winRows = [0, 0, 0, 0, 0];
  const winColumns = [0, 0, 0, 0, 0];

  if (debugging) {
    window.data = data;
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  return {
    clearData: function () {
      data.splice(0, data.length);
    },
    guessNumbers: function () {
      let i = 0;
      while (i < 25) {
        const number = getRandomInt(99);
        if (!data.includes(number) && number > 0) {
          data.push(number);
          i++;
        }
      }
      if (debugging) {
        console.log("Generated numbers: " + data);
      }
    },
    getNumbers: function () {
      return data;
    },
    guessAnnouncingNumbers: function () {
      const playData = [];
      while (playData.length < 98) {
        const number = getRandomInt(99);
        if (!playData.includes(number) && number > 0) {
          playData.push(number);
        }
      }
      return playData;
    },
    setCurrentNumber: function (number) {
      currentNumber = number;
    },
    getCurrentNumber: function () {
      return currentNumber;
    },
    getCurrentNumbers: function () {
      return currentNumbers;
    },
    addCurrentNumber: function (number) {
      currentNumbers.push(number);
    },
    clearCurrentNumbers: function () {
      currentNumbers.splice(0, currentNumbers.length);
    },
    registerHit: function (id) {
      winColumns[id[1]]++;
      winRows[id[0]]++;
      if (debugging) {
        console.log(winRows + " " + winColumns);
      }
    },
    checkWon: function () {
      if (winColumns.indexOf(5) >= 0 || winRows.indexOf(5) >= 0) return true;
    },
  };
})();

const UIController = (function () {
  const nodelistForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };
  const DOMStrings = {
    playButton: "#play_bingo",
    buttonSubmit: "#settings-submit",
    modal: "#modal-settings",
    modalButton: "#open-settings",
    modalClose: "close",
    gameField: ".game_field",
    settingsSubmit: "#settings-submit",
    shareButton: ".share-button",
    table: ".table",
    startButton: "#start",
  };

  function groupArr(data, n) {
    var group = [];
    for (var i = 0, j = 0; i < data.length; i++) {
      if (i >= n && i % n === 0) j++;
      group[j] = group[j] || [];
      group[j].push(data[i]);
    }
    return group;
  }

  function clearTable() {
    //remove old table, if present:
    const table = document.querySelector("table");
    if (table) {
      return table.remove();
    }
  }

  function changePlayButton() {
    const button = document.querySelector(DOMStrings.playButton);
    button.value = "Une fois encore!";
  }

  function renderStartButton() {
    const button = document.querySelector(DOMStrings.startButton);
    button.value = "Commencez!";
    button.classList.remove("hidden");
  }

  function changeStartButton() {
    const button = document.querySelector(DOMStrings.startButton);
    button.value =
      button.value === "Commencez!" || button.value === "Continuez!"
        ? "Arretez!"
        : "Continuez!";
  }

  function hideStartButton() {
    const button = document.querySelector(DOMStrings.startButton);
    button.classList.add("hidden");
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  let newGame = true;

  const playNextSounds = (numbers, startingIndex) => {
    if (numbers.length > 0) {
      if (debugging) {
        console.log("Current number " + numbers[startingIndex]);
      }

      const audio = new Audio();
      audio.src = `./numbers/fra-${numbers[startingIndex]}.mp3`;
      audio.currentTime = 0;
      const audio2 = new Audio();
      audio2.src = `./numbers/fra-${numbers[startingIndex]}.mp3`;
      audio2.currentTime = 0;
      if (newGame) {
        audio.pause();
        audio2.pause();
        return;
      }
      audio2.play();
      sleep(2000);
      AppController.setCurrentNumber(numbers[startingIndex]);
      AppController.addCurrentNumber(numbers[startingIndex]);
      numbers.shift();

      audio2.addEventListener("ended", async function () {
        audio.play();
        await sleep(4000);
        if (newGame) {
          audio.pause();
          audio2.pause();
          return;
        } else return playNextSounds(numbers, startingIndex);
      });
    }
  };

  const renderGameBoard = () => {
    const numbers = AppController.getNumbers();
    const groupedNumbers = groupArr(numbers, 5);
    const wrapper = document.querySelector(DOMStrings.gameField);
    tableString = `<table class="table"><tbody>`;
    for (var n = 0; n < groupedNumbers.length; n++) {
      const row = `<tr><td id="${n}-0">${groupedNumbers[n][0]}</td><td id="${n}-1">${groupedNumbers[n][1]}</td><td id="${n}-2">${groupedNumbers[n][2]}</td><td id="${n}-3">${groupedNumbers[n][3]}</td><td id="${n}-4">${groupedNumbers[n][4]}</td></tr>`;
      tableString += row;
    }
    tableString += "</tbody></table>";
    wrapper.innerHTML = tableString;
    wrapper.classList.remove("hidden");
  };

  function registerCheckFunction() {
    //const currentNumber = AppController.getCurrentNumber();
    //TODO: use currentNumber to show hint
    const calledNumbers = AppController.getCurrentNumbers();
    const clickedNumber = parseInt(this.innerHTML);
    const id = this.id.split("-");
    const classList = this.classList.value;
    if (!classList === "success" || classList === "") {
      this.classList.add("warning");
    }
    if (calledNumbers.indexOf(clickedNumber) >= 0) {
      this.classList.add("success");
      AppController.registerHit(id);
      this.removeEventListener("click", registerCheckFunction);
      if (AppController.checkWon()) {
        stopGame();
      }
    }
  }

  function stopGame() {
    newGame = true;
    const announcement = document.querySelector("#status");
    announcement.innerHTML = '<span class="won">Vouz avez gagné!</span>';
    hideStartButton();
    const sound = new Audio();
    sound.src = "./numbers/mixkit-ethereal-fairy-win-sound-2019.mp3";
    sound.currentTime = 0;
    sound.play();
    const tableCells = document.querySelectorAll("td");
    for (var i = 0; i < tableCells.length; i++) {
      tableCells[i].removeEventListener("click", registerCheckFunction);
    }
  }

  function addClickToTableCell() {
    const tableCells = document.querySelectorAll("td");
    for (var i = 0; i < tableCells.length; i++) {
      tableCells[i].addEventListener("click", registerCheckFunction);
    }
  }

  return {
    setNewGame: function () {
      newGame = true;
    },
    renderNewGame: function () {
      clearTable();
      changePlayButton();
      renderGameBoard();
      AppController.setCurrentNumber(0);
      AppController.clearCurrentNumbers();
      renderStartButton();
    },
    getDOMStrings: function () {
      return DOMStrings;
    },
    setModal: function () {
      // Get the modal
      let modal = document.querySelector(DOMStrings.modal);

      // Get the button that opens the modal
      let btn = document.querySelector(DOMStrings.modalButton);

      // Get the <span> element that closes the modal
      let span = document.getElementsByClassName(DOMStrings.modalClose)[0];

      // Get Tallenna button
      let close = document.querySelector(DOMStrings.buttonSubmit);

      // When the user clicks on the button, open the modal
      btn.onclick = function () {
        modal.style.display = "block";
      };

      // When the user clicks on <span> (x), close the modal
      span.onclick = function () {
        modal.style.display = "none";
      };

      // When the user clicks anywhere outside of the modal, close it
      window.onclick = function (event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      };
      //Close modal also with the Tallenna button
      close.onclick = function () {
        modal.style.display = "none";
        return false; //prevents page from reloading
      };
    },
    hideModal: function () {
      const modal = document.querySelector(DOMStrings.modal);
      modal.style.display = "none";
    },
    announceNumber: function () {
      if (newGame === true) {
        newGame = false;
        const numbers = AppController.guessAnnouncingNumbers();
        if (debugging) {
          window.numbers = numbers;
        }
        const currentIndex =
          AppController.getCurrentNumber() === 0
            ? 0
            : numbers.indexOf(AppController.getCurrentNumber());
        changeStartButton();
        //3. register click for fields:
        addClickToTableCell();
        return playNextSounds(numbers, currentIndex);
      } else {
        newGame = true;
        changeStartButton();
      }
    },
  };
})();

//Main app
const Controller = (function (AppController, UIController) {
  const setupEventListeners = function () {
    //call the function from UIController
    var DOM = UIController.getDOMStrings();

    //Click for new Game
    document
      .querySelector(DOM.playButton)
      .addEventListener("click", startNewGame); //callback function, does not have to be called here directly

    document
      .querySelector(DOM.startButton)
      .addEventListener("click", UIController.announceNumber);

    //click for saving settings
    document.querySelector(DOM.settingsSubmit);
    //.addEventListener("click", UIController.updateSettings);

    //Share button
    document.querySelector(DOM.shareButton);
    //.addEventListener("click", UIController.webShare);

    if (navigator.share === undefined) {
      if (window.location.protocol === "http:") {
        // navigator.share() is only available in secure contexts.
        window.location.replace(
          window.location.href.replace(/^http:/, "https:")
        );
      } else {
        logError("Error: You need to use a browser that supports web sharing.");
        //hide button, if not supported
        document.querySelector(DOM.shareButton).classList.add("hidden");
      }
    }
  };

  //error function for webshare function
  function logText(message, isError) {
    if (isError) console.error(message);
    else console.log(message);
  }

  function logError(message) {
    logText(message, true);
  }

  function regSW() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/Bingo/sw.js")
        .then(function (reg) {
          if (reg.installing) {
            console.log("Service worker installing");
          } else if (reg.waiting) {
            console.log("Service worker installed");
          } else if (reg.active) {
            console.log("Service worker active");
          }
        })
        .catch(function (err) {
          console.info("Service workers are not supported. " + err);
        });
    }
  }

  function startNewGame() {
    UIController.setNewGame();
    //Guess new numbers
    AppController.clearData();
    AppController.guessNumbers();
    // 2. render the table
    UIController.renderNewGame();
  }

  return {
    init: function () {
      console.log("Application has started.");
      UIController.setModal();
      //loadData();
      setupEventListeners();
      regSW();
    },
  };
})(AppController, UIController);

Controller.init();
