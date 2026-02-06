const Password = "5555";

// ====================
// ===   PASSWORD HINTS  ===
// ====================
console.log("Check the javascript file to find the PIN");
console.log("Don't worry, It is at the first line of the file.");

// ====================
// ===   DATE AND TIME      ===
// ====================

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

// ====================
// === LOCK/ HOME LOCK  ===
// ====================
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
        "system/index.html",
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

// ====================
// === BATTERY STATUS       ===
// ====================
const lucideBattery = document.getElementsByClassName("lucide-battery-medium");

navigator.getBattery().then((battery) => {
  const batteryLevels = document.getElementsByClassName("battery-level");
  const chargingIndicators =
    document.getElementsByClassName("charging-indicator");

  const updateBatteryStatus = () => {
    const displayStyle = battery.charging ? "block" : "none";
    const levelWidth = battery.level * 10;

    for (let i = 0; i < lucideBattery.length; i++) {
      chargingIndicators[i].style.display = displayStyle;
      batteryLevels[i].setAttribute("width", levelWidth);
    }
  };

  updateBatteryStatus();
  battery.addEventListener("chargingchange", updateBatteryStatus);
  battery.addEventListener("levelchange", updateBatteryStatus);
});
