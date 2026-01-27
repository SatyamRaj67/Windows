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

const goToLockScreen = () => {
  lockHomeScreen.classList.add("active");
  lockScreen.classList.add("active");
};

lockHomeScreen.addEventListener("click", (e) => {
  if (!e.target.closest(".card, a")) goToLockScreen();
});
