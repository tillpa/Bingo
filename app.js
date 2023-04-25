const debugging = false;

const AppController = (function () {
  const date = new Date();
  const data = [];
  let currentNumber = 0;

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

  function sleep(ms) {
    //console.log("sleeping");
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  let newGame = true;

  const playNextSounds = (numbers, startingIndex) => {
    if (numbers.length > 0) {
      console.log("Current number " + numbers[startingIndex]);
      //console.log("New Game is " + newGame);
      const audio = new Audio();
      audio.src = `./numbers/fra-${numbers[startingIndex]}.mp3`;
      audio.currentTime = 0;
      const audio2 = new Audio();
      audio2.src = `./numbers/fra-${numbers[startingIndex]}.mp3`;
      audio2.currentTime = 0;
      if (newGame) {
        //console.log("newGame is true 1");
        audio.pause();
        audio2.pause();
        return;
      }
      audio2.play();
      //console.log("audio2 playing");
      sleep(1500);
      AppController.setCurrentNumber(numbers[startingIndex]);
      numbers.shift();

      audio2.addEventListener("ended", async function () {
        audio.play();
        //console.log("audio playing");
        await sleep(3000);
        if (newGame) {
          //console.log("newGame is true 2");
          audio.pause();
          audio2.pause();
          return;
        } else return playNextSounds(numbers, startingIndex);
      });
    }
  };

  return {
    setNewGame: function () {
      newGame = true;
    },
    renderNewGame: function () {
      clearTable();
      changePlayButton();
      const numbers = AppController.getNumbers();
      const groupedNumbers = groupArr(numbers, 5);
      const wrapper = document.querySelector(DOMStrings.gameField);
      tableString = `<table class="table"><tbody>`;
      console.log(wrapper.childNodes);
      for (var n = 0; n < groupedNumbers.length; n++) {
        const row = `<tr><td>${groupedNumbers[n][0]}</td><td>${groupedNumbers[n][1]}</td><td>${groupedNumbers[n][2]}</td><td>${groupedNumbers[n][3]}</td><td>${groupedNumbers[n][4]}</td></tr>`;
        tableString += row;
      }
      tableString += "</tbody></table>";
      wrapper.innerHTML = tableString;
      wrapper.classList.remove("hidden");
      AppController.setCurrentNumber(0);
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
        //const numbers = [3, 6, 9, 44];
        const numbers = AppController.guessAnnouncingNumbers();
        const currentIndex =
          AppController.getCurrentNumber() === 0
            ? 0
            : numbers.indexOf(AppController.getCurrentNumber());
        // console.log(
        //   `newGame is true, current Number is ${currentIndex}, type is ${typeof currentIndex}`
        // );
        //console.log(`current number ${numbers[currentIndex]}`);

        changeStartButton();
        return playNextSounds(numbers, currentIndex);
      } else {
        newGame = true;
        changeStartButton();
        // console.log(
        //   `Newgame is false, current number is ${AppController.getCurrentNumber()}`
        // );
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
        logError(
          "Error: You need to use a browser that supports this draft " +
            "proposal."
        );
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
        .register("/Tyo-aikaApp/sw.js")
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

  var loadData = function () {
    // 1. Load data from local storage
    var storedData = AppController.getStoredData();

    if (storedData) {
      // 2. insert the saved data into local storage
      AppController.updateData(storedData);
      // 3. update status line
      UIController.status();
    }
  };

  function startNewGame() {
    UIController.setNewGame();
    //console.log("newGame set to true");
    //1. guess new numbers
    AppController.clearData();
    AppController.guessNumbers();
    // 2. render the table
    UIController.renderNewGame();
    //3. get correct sound files
    //4. play sound files

    //5. check, if vertical or horizontal row is checked (has to be clicked)
    //6. Show hint, if row would have been checked.
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
