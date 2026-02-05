export class WindowManager {
  constructor() {
    this.windows = [];
    this.activeWindowId = null;
    this.zIndexCounter = 100;
    this.desktopContainer = document.getElementById("desktop-container");
    this.taskbarTray = document.getElementById("taskbar-app-tray");
  }

  openWindow(appConfig) {
    const id = `win-${Date.now()}`;

    const windowEl = this.createWindowDOM(id, appConfig);

    // Check for existing pinned taskbar item
    const existingTaskbarEl = this.taskbarTray.querySelector(
      `li[data-name="${appConfig.name}"]`
    );

    let taskbarEl;
    let isPinned = false;

    if (existingTaskbarEl) {
      taskbarEl = existingTaskbarEl;
      isPinned = true;
      taskbarEl.classList.add("open");
    } else {
      taskbarEl = this.createTaskbarDOM(appConfig);
      this.taskbarTray.appendChild(taskbarEl);
    }

    // Create a specific toggle handler for this window instance
    const toggleHandler = () => {
      const win = this.windows.find((w) => w.id === id);
      if (win) {
        if (win.element.style.display === "none") {
          this.focusWindow(id);
        } else if (win.element.classList.contains("active")) {
          this.minimizeWindow(id);
        } else {
          this.focusWindow(id);
        }
      }
    };

    // Attach the handler
    taskbarEl.addEventListener("click", toggleHandler);

    this.desktopContainer.appendChild(windowEl);
    
    this.windows.push({
      id,
      ...appConfig,
      element: windowEl,
      taskbarElement: taskbarEl,
      isPinned,
      toggleHandler, // Store handler reference for removal later
    });

    this.focusWindow(id);
  }

  closeWindow(id) {
    const winIdx = this.windows.findIndex((w) => w.id === id);
    if (winIdx > -1) {
      const win = this.windows[winIdx];

      // Cleanup DOM
      win.element.remove();

      // IMPORTANT: Remove the specific event listener for this window
      // so clicking the pinned icon later doesn't try to toggle a dead window.
      win.taskbarElement.removeEventListener("click", win.toggleHandler);

      if (win.isPinned) {
        // Only remove 'open' class if no other windows use this pinned icon
        const hasOtherInstances = this.windows.some(
          (w) => w.taskbarElement === win.taskbarElement && w.id !== id
        );
        if (!hasOtherInstances) {
          win.taskbarElement.classList.remove("open");
        }
      } else {
        // If it was a temp icon, remove it completely
        win.taskbarElement.remove();
      }

      this.windows.splice(winIdx, 1);
    }
  }

  focusWindow(id) {
    const win = this.windows.find((w) => w.id === id);
    if (win) {
      this.zIndexCounter++;
      win.element.style.zIndex = this.zIndexCounter;
      win.element.style.display = "";

      this.windows.forEach((w) => w.element.classList.remove("active"));
      win.element.classList.add("active");
      this.activeWindowId = id;
    }
  }

  maximizeWindow(id) {
    const win = this.windows.find((w) => w.id === id);
    if (win) {
      win.element.style.left = "0";
      win.element.style.top = "0";
      win.element.style.width = "100%";
      win.element.style.height = "100%";
    }

    this.focusWindow(id);
    this.classList.add("maximized");
  }

  minimizeWindow(id) {
    const win = this.windows.find((w) => w.id === id);
    if (win) {
      win.element.style.display = "none";
    }
  }

  createWindowDOM(id, config) {
    const el = document.createElement("div");
    el.classList.add("window-frame");
    el.id = id;
    el.style.position = "absolute";
    el.style.left = "100px";
    el.style.top = "50px";

    el.addEventListener("mousedown", () => this.focusWindow(id));

    el.innerHTML = `
            <div class="title-bar">
                <div class="title">
                    <img src="${config.img_src}" alt="${config.name}" class="icon">
                    <span>${config.name}</span>
                </div>
                <div class="controls">
                    <button class="btn-min"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus-icon lucide-minus"><path d="M5 12h14"/></svg></button>
                    <button class="btn-max"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-icon lucide-square"><rect width="18" height="18" x="3" y="3" rx="2"/></svg></button>
                    <button class="btn-close"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                </div>
            </div>
            <div class="window-content">
                <h1>Welcome to ${config.name}</h1>
            </div>
        `;
    el.querySelector(".btn-close").addEventListener("click", (e) => {
      e.stopPropagation();
      this.closeWindow(id);
    });

    el.querySelector(".btn-max").addEventListener("click", (e) => {
      e.stopPropagation();
      this.maximizeWindow(id);
    });

    el.querySelector(".btn-min").addEventListener("click", (e) => {
      e.stopPropagation();
      this.minimizeWindow(id);
    });

    const titleBar = el.querySelector(".title-bar");
    this.makeDraggable(el, titleBar);

    return el;
  }

  createTaskbarDOM(config) {
    const li = document.createElement("li");
    li.classList.add("app");
    li.classList.add("open"); // New items are open by default
    li.dataset.name = config.name; // Ensure new items also have the name
    li.innerHTML = `
      <img src="${config.img_src}" alt="${config.name}" />
    `;
    // Note: No click listener added here anymore, it's added in openWindow
    return li;
  }

  makeDraggable(windowEl, handleEl) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    handleEl.style.cursor = "default";

    const onMouseDown = (e) => {
      if (e.target.closest(".controls")) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      initialX = windowEl.offsetLeft;
      initialY = windowEl.offsetTop;

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      windowEl.style.left = `${initialX + dx}px`;
      windowEl.style.top = `${initialY + dy}px`;
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    handleEl.addEventListener("mousedown", onMouseDown);
  }
}
