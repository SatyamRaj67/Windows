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
