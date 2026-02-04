const Password = "5555";

console.log("Check the javascript file to find the PIN");
console.log("Don't worry, It is at the first line of the file.");

document.getElementById("time").innerText = new Date().toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

document.getElementById("day-date").innerText = new Date().toLocaleDateString(
  undefined,
  {
    weekday: "long",
    month: "long",
    day: "numeric",
  },
);

// From Lock Home Screen to Lock Screen
const lockHomeScreen = document.getElementById("lock-home-screen");
const lockScreen = document.getElementById("lock-screen");

const passwordInput = document.getElementById("password");
const hint = document.getElementById("hint");

const goToLockScreen = () => {
  lockHomeScreen.classList.add("active");
  lockScreen.classList.add("active");
};

const goToScreen = () => {
  lockHomeScreen.classList.remove("active");
  lockScreen.classList.remove("active");
};

document.addEventListener("click", (e) => {
  if (!e.target.closest(".card, a")) goToLockScreen();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") goToLockScreen();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "PageUp" || e.key === "ArrowUp" || e.key === "Escape")
    goToScreen();
});

passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (passwordInput.value.trim() === Password) {
      window.location.href = new URL(
        "home/index.html",
        window.location.href,
      ).href;
    } else {
      hint.classList.add("active");
      
      passwordInput.classList.remove("error");
      void passwordInput.offsetWidth;
      passwordInput.classList.add("error");
    }
  }
});
