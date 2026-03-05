// ====================
// ===   PAGE TRANSITION  ===
// ====================
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  const audio = document.querySelector("#page-transition audio");
  if (audio) {
    audio.play().catch((error) => {
      console.warn("Failed to play startup sound:", error);
    });
  }
});

// ====================
// ===   HELPER FUNCTION ===
// ====================
async function loadJSON(path) {
  try {
    const response = await fetch(path);
    return await response.json();
  } catch (error) {
    console.error(`Error loading JSON from ${path}:`, error);
    return [];
  }
}

/**
 * @param {HTMLElement} element 
 * @param {HTMLElement} handle 
 * @description Enables dragging of the specified element using the provided handle. The function sets up event listeners for mouse down, move, and up events to track the dragging motion and update the element's position accordingly.
 */
function dragElement(element, handle) {
  var dx = 0, dy = 0, startX = 0, startY = 0;

  handle.addEventListener("mousedown", dragMouseDown);

  function dragMouseDown(e) {
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;

    element.classList.add("dragging");

    document.addEventListener("mouseup", closeDragElement);
    document.addEventListener("mousemove", elementDrag);
  }

  function elementDrag(e) {
    e.preventDefault();
    dx = startX - e.clientX;
    dy = startY - e.clientY;
    startX = e.clientX;
    startY = e.clientY;

    element.style.top = (element.offsetTop - dy) + "px";
    element.style.left = (element.offsetLeft - dx) + "px";
  }

  function closeDragElement() {
    element.classList.remove("dragging");

    document.removeEventListener("mouseup", closeDragElement);
    document.removeEventListener("mousemove", elementDrag);
  }
}

/**
 * 
 * @param {HTMLElement} element 
 * @description Adds 8 resize handles at the 8 cardinal directions (N, NE, E, SE, S, SW, W, NW) to the specified element and sets up event listeners to allow resizing by dragging these handles. 
 */
function resizeElement(element) {
  const handles = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
  handles.forEach((handle) => {
    const div = document.createElement("div");
    div.classList.add("resize-handle", handle);
    element.appendChild(div);

    div.addEventListener("mousedown", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
      const startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
      const startTop = element.offsetTop;
      const startLeft = element.offsetLeft;

      element.classList.add("dragging");

      function doDrag(e) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (handle.includes("e")) {
          element.style.width = startWidth + dx + "px";
        }
        if (handle.includes("w")) {
          element.style.width = startWidth - dx + "px";
          element.style.left = startLeft + dx + "px";
        }
        if (handle.includes("s")) {
          element.style.height = startHeight + dy + "px";
        }
        if (handle.includes("n")) {
          element.style.height = startHeight - dy + "px";
          element.style.top = startTop + dy + "px";
        }
      }

      function stopDrag() {
        element.classList.remove("dragging");
        document.removeEventListener("mousemove", doDrag);
        document.removeEventListener("mouseup", stopDrag);
      }

      document.addEventListener("mousemove", doDrag);
      document.addEventListener("mouseup", stopDrag);
    });
  });
}

// ====================
// ===   INITIALIZATION   ===
// ====================

/**
 * The structure of each app object in the Installed_Apps array loaded from Installed_Apps.json
 * @returns {
 * id : string,
 * name : string,
 * app : string,
 * img_src : string,
 * grid_area : string,
 * content : string
 * }
 */
const Installed_Apps = await loadJSON("data/Installed_Apps.json");
if (Installed_Apps.length === 0) {
  console.warn("No installed apps loaded - desktop and taskbar will be empty");
}


// =====================
// ===    UI WORKINGS          ===
// =====================

// == Time Display ==
const timeEl = document.getElementById("time");

function updateTime() {
  // Get current time and format it as HH:MM AM/PM
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  timeEl.textContent = `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

updateTime();
setInterval(updateTime, 1000);

// == Date Display ==
const dateEl = document.getElementById("date");

function updateDate() {
  // Get current date and format it as MM/DD/YYYY
  const now = new Date();
  const month = (now.getMonth() + 1).toString();
  const day = now.getDate().toString();
  const year = now.getFullYear();
  dateEl.textContent = `${month}/${day}/${year}`;
}
updateDate();

// ========================
// === DESKTOP MANAGEMENT   ===
// ========================

// == Helper Function
function gridAreaToPosition(gridArea) {
  const [col, row] = gridArea.match(/\d+/g).map(Number);
  return { col: parseInt(col), row: parseInt(row) };
}

// == Render Desktop Icons
const desktopContainer = document.getElementById("desktop-icon-container");
const fragment = document.createDocumentFragment();

// == Constants for icon sizing and spacing
const icon_width = 80;
const icon_height = 80;
const icon_gap = 20;

Installed_Apps.forEach((app) => {
  if (!app.grid_area) return;

  const icon = document.createElement("div");
  icon.classList.add("desktop-icon");

  icon.dataset.appId = app.id;

  const position = gridAreaToPosition(app.grid_area);
  icon.style.left = `${(position.col - 1) * (icon_width + icon_gap) + icon_gap}px`;
  icon.style.top = `${(position.row - 1) * (icon_height + icon_gap) + icon_gap}px`;
  icon.style.width = `${icon_width}px`;
  icon.style.height = `${icon_height}px`;

  const img = document.createElement("img");
  img.src = app.img_src;
  img.alt = app.name;

  const span = document.createElement("span");
  span.textContent = app.name;

  icon.appendChild(img);
  icon.appendChild(span);
  fragment.appendChild(icon);
});

desktopContainer.appendChild(fragment);

// === Event Listener for Desktop Icons ===
desktopContainer.addEventListener("click", (event) => {
  const icon = event.target.closest(".desktop-icon");
  desktopContainer
    .querySelectorAll(".desktop-icon")
    .forEach((ic) => ic.classList.remove("selected"));

  if (!icon) return;
  icon.classList.add("selected");
});

desktopContainer.addEventListener("dblclick", (event) => {
  const icon = event.target.closest(".desktop-icon");
  if (!icon) return;

  const appId = icon.dataset.appId;

  const app = Installed_Apps.find((a) => a.id === appId);
  if (!app) {
    console.warn(`App with id ${appId} not found in Installed_Apps`);
    return;
  }
  openWindow(app);
})

// ========================
// === WINDOWS MANAGEMENT ===
// ========================
const windows = new Map();
const desktop = document.getElementById("window-container");

/**
 * @param {App} app 
 * @returns void
 * @description Opens a new window for the specified app. If a window for the app already exists, it brings that window to the front instead. The function creates a new window element with header and main content based on the app's properties, adds event listeners for window controls (minimize, maximize, close), and enables dragging and resizing of the window. 
 */
function openWindow(app) {
  // == Check if window already exists
  if (windows.has(app.id)) {
    focusWindow(app.id);
    return;
  }

  // == Create window element
  const winEl = document.createElement("div");
  winEl.classList.add("window");
  winEl.classList.add("maximized");
  winEl.style.zIndex = zIndexBase + windows.size;
  winEl.innerHTML =
    /* HTML */
    `<header>
    <div>
      <img src="${app.img_src}" alt="${app.name}" class="window-icon">
      <span>${app.name}</span>
    </div>
    <div>
      <button id="minimize-btn">–</button>
      <button id="maximize-btn">▢</button>
      <button id="close-btn">×</button>
    </div>
  </header>
  <main>
    ${app.content}
  </main>
  `;
  windows.set(app.id, winEl);
  desktop.appendChild(winEl);

  // == Add event listeners for window controls
  const minimizeBtn = winEl.querySelector("#minimize-btn");
  const maximizeBtn = winEl.querySelector("#maximize-btn");
  const closeBtn = winEl.querySelector("#close-btn");

  minimizeBtn.addEventListener("click", () => {
    winEl.classList.toggle("minimized");

    // Update taskbar icon state
    const taskbarIcon = document.querySelector(`#taskbar-app-tray li[data-app-id="${app.id}"]`);

    if (winEl.classList.contains("minimized")) {
      taskbarIcon.classList.remove("focused");
    }
  });

  maximizeBtn.addEventListener("click", () => {
    winEl.classList.toggle("maximized");
  });

  closeBtn.addEventListener("click", () => {
    windows.delete(app.id);
    winEl.remove();

    // Remove taskbar states or the icon itself if not pinned
    const taskbarIcon = document.querySelector(`#taskbar-app-tray li[data-app-id="${app.id}"]`);
    if (taskbarIcon) {
      taskbarIcon.classList.remove("open", "focused");
      if (!app.pinned) {
        taskbarIcon.remove();
      }
    }
  });

  const header = winEl.querySelector("header div:first-child");
  dragElement(winEl, header);
  resizeElement(winEl);

  winEl.addEventListener("mousedown", () => focusWindow(app.id));

  let taskbarIcon = document.querySelector(`#taskbar-app-tray li[data-app-id="${app.id}"]`);
  if (!taskbarIcon) {
    appendIconToTaskbar(app);
    taskbarIcon = document.querySelector(`#taskbar-app-tray li[data-app-id="${app.id}"]`);
  }
  if (taskbarIcon) taskbarIcon.classList.add("open");

  focusWindow(app.id);
}

/**
 * 
 * @param {app.id} id - The unique identifier of the app/window to focus
 * @returns void
 * @description Brings the specified window to the front by updating its z-index. The z-index is calculated based on a base value plus the current number of open windows, ensuring that the focused window appears above all others.
 */

let zIndexBase = 100;

function focusWindow(id) {
  const winEl = windows.get(id);
  if (!winEl) return;

  zIndexBase++;
  winEl.style.zIndex = zIndexBase;

  document.querySelectorAll("#taskbar-app-tray li").forEach(li => li.classList.remove("focused"));
  const taskbarIcon = document.querySelector(`#taskbar-app-tray li[data-app-id="${id}"]`);
  if (taskbarIcon) taskbarIcon.classList.add("focused");
}

// ========================
// === TASKBAR MANAGEMENT   ===
// ========================
const taskbar = document.getElementById("taskbar-app-tray");
const taskbarFragment = document.createDocumentFragment();

Installed_Apps.forEach((app) => {
  if (!app.pinned) return;

  const taskbarIcon = document.createElement("li");
  taskbarIcon.dataset.appId = app.id;

  const img = document.createElement("img");

  img.src = app.img_src;
  img.alt = app.name;

  taskbarIcon.appendChild(img);

  taskbarFragment.appendChild(taskbarIcon);
});

taskbar.appendChild(taskbarFragment);

/**
 * @param {App} app - The app object containing at least id, name, and img_src properties
 * @description Helper function to add an app icon to the taskbar when an app is opened, if it's not already pinned
 */
function appendIconToTaskbar(app) {
  const taskbarIcon = document.createElement("li");
  taskbarIcon.dataset.appId = app.id;

  const img = document.createElement("img");
  img.src = app.img_src;
  img.alt = app.name;
  taskbarIcon.appendChild(img);
  taskbar.appendChild(taskbarIcon);
}

// === Event Listener for Taskbar Icons ===
taskbar.addEventListener("click", (event) => {
  const icon = event.target.closest("li");
  if (!icon) return;

  const appId = icon.dataset.appId;
  const app = Installed_Apps.find((a) => a.id === appId);
  if (!app) {
    console.warn(`App with id ${appId} not found in Installed_Apps`);
    return;
  }

  const existingWindow = windows.get(app.id);

  if (!existingWindow) {
    openWindow(app);
    return;
  }

  const isFocused = icon.classList.contains("focused");

  if (!isFocused) {
    focusWindow(app.id);
    existingWindow.classList.remove("minimized");
    return;
  }

  const isMinimized = existingWindow.classList.contains("minimized");

  if (isMinimized) {
    existingWindow.classList.remove("minimized");
  } else {
    existingWindow.classList.add("minimized");
    icon.classList.remove("focused");
  }
});

// ==========================
// === START MENU MANAGEMENT  ===
// ==========================
const startMenuBtn = document.getElementById("start-menu-btn");
const startMenu = document.getElementById("start-menu");

startMenuBtn.addEventListener("click", () => {
  startMenu.classList.toggle("visible");
});

// ============================
// === NOTIFICATION MENU                   ===
// ============================

// === Event Listener for Notification Menu ===
const notificationMenuBtn = document.getElementById("date-time");
const notificationMenu = document.getElementById("notification-menu");
notificationMenuBtn.addEventListener("click", () => {
  notificationMenu.classList.toggle("visible");
});

// === Notification Date Display ===
const notificationDate = document.getElementById("notification-date");
notificationDate.textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

// === Toggle Calendar View in Notification Menu ===
const notificationCalendarToggle = document.getElementById("notification-calendar-toggle");

notificationCalendarToggle.addEventListener("click", () => {
  const notificationCalendar = document.getElementById("notification-calendar");
  notificationCalendar.classList.toggle("collapsed");
})

// === Notification Calendar Month Display ===
const noticationCalendarMonth = document.getElementById("notification-calendar-month");
function updateCalendarMonth() {
  const now = new Date();
  const month = now.toLocaleString(undefined, { month: "long" });
  const year = now.getFullYear();
  noticationCalendarMonth.textContent = `${month} ${year}`;
}
updateCalendarMonth();

// === Populate Dates in Calendar ===
const notificationCalendarMainDates = document.getElementById("notification-calendar-main-dates");

function renderCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  const today = now.getDate();

  // Get days in current and previous months
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Get the day of the week for the 1st of the month (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  notificationCalendarMainDates.innerHTML = "";

  const fragment = document.createDocumentFragment();
  const totalCells = 42;

  for (let i = 0; i < totalCells; i++) {
    const dateCell = document.createElement("p");

    if (i < firstDayOfWeek) {
      dateCell.textContent = daysInPrevMonth - firstDayOfWeek + i + 1;
    } else if (i >= firstDayOfWeek && i < firstDayOfWeek + daysInCurrentMonth) {
      // Current month dates
      const dateNum = i - firstDayOfWeek + 1;
      dateCell.textContent = dateNum;
      dateCell.classList.add("active");

      if (dateNum === today) {
        dateCell.classList.add("today");
      }
    } else {
      // Next month dates
      dateCell.textContent = i - (firstDayOfWeek + daysInCurrentMonth) + 1;
    }

    fragment.appendChild(dateCell);
  }

  notificationCalendarMainDates.appendChild(fragment);
}

renderCalendar();