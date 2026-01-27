// Set time and date on lock screen
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
  if (e.key === "PageUp") goToScreen();
});

passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (passwordInput.value === "1234") {
      window.location.href = new URL(
        "home/index.html",
        window.location.href,
      ).href;
    } else {
      hint.classList.add("active");
    }
  }
});
