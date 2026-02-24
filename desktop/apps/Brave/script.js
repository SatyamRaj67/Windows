// ========================
// PLEASE DON'T CHEAT ON THIS FILE
// This files contains hidden easter eggs for people to find as well, so please don't mess with it.
// ========================

const feelingLucky_Params = [
  "Flavortown",
  "I am also feeling Lucky",
  "You are a moron if you click this",
  "MEOW",
  "I am not feeling lucky : ( ",
];

const input = document.getElementById("search");

const feelingLuckyButton = document.getElementById("feeling-lucky");
const searchButton = document.getElementById("search-button");

input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    switch (input.value.toLowerCase()) {
      default:
        event.preventDefault();
        const query = input.value;
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

        window.open(url, "_blank");
        break;

      case "brave":
        event.preventDefault();
        alert("You are already using Brave! Great choice!");
        break;

      case "chrome":
        event.preventDefault();
        alert("CHROME FREAKING SUCKS!!");
        break;

      case "opera":
        event.preventDefault();
        alert(
          "OK, YOU STUPID ANIME LOVERS WHO KEEP CALLING THEMSELVES THE 'TRUE PASSIONATE GAMERS'!",
        );
        break;

      case "meow":
        event.preventDefault();
        alert("HAHA!! I am feeling lucky now!!");
        const secret_message =
          "For now, you have cracked the code, but there is still more to find!!";
        feelingLucky_Params.push(secret_message);
        break;
    }
  }
});

// === Event Listeners ===
feelingLuckyButton.addEventListener("click", function () {
  const randomIndex = Math.floor(Math.random() * feelingLucky_Params.length);
  const randomParam = feelingLucky_Params[randomIndex];

  input.value = randomParam;
});

searchButton.addEventListener("click", function () {
  const event = new KeyboardEvent("keypress", {
    key: "Enter",
  });
  input.dispatchEvent(event);
});
