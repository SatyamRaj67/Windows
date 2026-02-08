export class WindowManager {
  constructor() {
    this.windows = new Map();
    this.zIndex = 100;
    this.desktop = document.getElementById("desktop-container");
    this.taskbar = document.getElementById("taskbar-app-tray");
  }

  // === PUBLIC API ===

  openWindow(app) {
    if (this.windows.has(app.id)) return this.focusWindow(app.id);

    const winEl = this.createWindowDOM(app);
    this.desktop.appendChild(winEl);

    let taskbarItem = this.taskbar.querySelector(`li[data-id="${app.id}"]`);
    let isTemp = false;

    if (!taskbarItem) {
      taskbarItem = this.createTaskbarDOM(app);
      this.taskbar.appendChild(taskbarItem);
      isTemp = true;
    }
    taskbarItem.classList.add("open");

    // Initialize unified drag/resize/focus logic
    const controller = this.enableWindowLogic(winEl, app.id);

    this.windows.set(app.id, {
      element: winEl,
      taskbarElement: taskbarItem,
      isTemp,
      controller,
    });
    this.focusWindow(app.id);
  }

  closeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.controller.abort(); // Kill all event listeners for this window
    win.element.remove();
    win.taskbarElement.classList.remove("open", "active");
    if (win.isTemp) win.taskbarElement.remove();
    this.windows.delete(id);
  }

  toggleWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    if (
      win.element.classList.contains("active") &&
      !win.element.classList.contains("minimized")
    ) {
      this.minimizeWindow(id);
    } else {
      this.focusWindow(id);
    }
  }

  focusWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    // UI Updates
    win.element.classList.remove("minimized");
    win.element.style.display = ""; // Reset display if hidden
    win.element.style.zIndex = ++this.zIndex;

    // Toggle Active Classes
    document
      .querySelectorAll(".window-frame")
      .forEach((w) => w.classList.toggle("active", w === win.element));
    document
      .querySelectorAll(".app")
      .forEach((a) => a.classList.toggle("active", a === win.taskbarElement));
  }

  minimizeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;
    win.element.classList.add("minimized");
    win.element.classList.remove("active");
    win.taskbarElement.classList.remove("active");
  }

  maximizeWindow(id) {
    this.windows.get(id)?.element.classList.toggle("maximized");
  }

  // === DOM GENERATION ===

  createWindowDOM(app) {
    const el = document.createElement("div");
    el.classList.add(
      "window-frame",
      app.app === "Notepad" ? "notepad" : "default",
    );

    // Initial Position/Size
    Object.assign(el.style, {
      top: "50px",
      left: "100px",
      width: "400px",
      height: "300px",
    });

    // Internal Content
    const content = app.iframe_src
      ? `<iframe src="${app.iframe_src}" style="width:100%;height:100%;border:none;pointer-events:none;"></iframe>`
      : app.content || "";

    el.innerHTML = `
      <!-- Resize Handles -->
      <div class="resizer n"></div><div class="resizer e"></div><div class="resizer s"></div><div class="resizer w"></div>
      <div class="resizer nw"></div><div class="resizer ne"></div><div class="resizer se"></div><div class="resizer sw"></div>
      
      <!-- Title Bar -->
      <div class="title-bar">
        <div class="title">
          <div class="imgBx"><img class="icon" src="${app.img_src}" alt="${app.name}"></div>
          <span class="title-text">${app.name}</span>
        </div>
        <div class="controls">
          <button class="min"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus-icon lucide-minus"><path d="M5 12h14"/></svg></button>
          <button class="max"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-icon lucide-square"><rect width="18" height="18" x="3" y="3" rx="2"/></svg></button>
          <button class="close"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
        </div>
      </div>
      
      <!-- Content -->
      <div class="window-content">${content}</div>
    `;

    // Button Listeners
    el.querySelector(".close").onclick = () => this.closeWindow(app.id);
    el.querySelector(".max").onclick = () => this.maximizeWindow(app.id);
    el.querySelector(".min").onclick = () => this.minimizeWindow(app.id);

    return el;
  }

  createTaskbarDOM(app) {
    const li = document.createElement("li");
    li.className = "app";
    li.dataset.id = app.id;
    li.innerHTML = `<img src="${app.img_src}" alt="${app.name}" />`;
    li.onclick = () => this.toggleWindow(app.id);
    return li;
  }

  // === CORE INTERACTION LOGIC (Drag & Resize) ===

  enableWindowLogic(el, id) {
    const controller = new AbortController();
    const { signal } = controller;

    // State
    const state = {
      isDragging: false,
      isResizing: false,
      resizeDir: null, // n, s, e, w, ne, nw, se, sw
      startX: 0,
      startY: 0,
      startW: 0,
      startH: 0,
      startL: 0,
      startT: 0,
    };

    // Helper: Toggle Iframe Interaction (prevents dragging lag)
    const toggleFrames = (enable) => {
      el.querySelectorAll("iframe").forEach(
        (f) => (f.style.pointerEvents = enable ? "all" : "none"),
      );
    };

    // 1. Mouse Down (Start Action)
    el.addEventListener(
      "mousedown",
      (e) => {
        this.focusWindow(id);

        const target = e.target;

        // Check for Resizing
        if (target.classList.contains("resizer")) {
          state.isResizing = true;
          state.resizeDir = target.className.replace("resizer ", "").trim();
        }
        // Check for Dragging (Title bar only, not controls)
        else if (target.closest(".title-bar") && !target.closest(".controls")) {
          state.isDragging = true;
        } else {
          return; // Clicked on content or buttons
        }

        // Capture Initial State
        state.startX = e.clientX;
        state.startY = e.clientY;
        const rect = el.getBoundingClientRect();
        state.startW = rect.width;
        state.startH = rect.height;
        state.startL = el.offsetLeft;
        state.startT = el.offsetTop;

        toggleFrames(false); // Disable iframes during move/resize
        e.preventDefault();
      },
      { signal },
    );

    // 2. Mouse Move (Update Action) - Attached to Document
    document.addEventListener(
      "mousemove",
      (e) => {
        if (!state.isDragging && !state.isResizing) return;

        const dx = e.clientX - state.startX;
        const dy = e.clientY - state.startY;

        if (state.isDragging && !el.classList.contains("maximized")) {
          el.style.left = `${state.startL + dx}px`;
          el.style.top = `${state.startT + dy}px`;
        }

        if (state.isResizing) {
          const d = state.resizeDir;
          const s = el.style;

          // Vertical
          if (d.includes("s"))
            s.height = `${Math.max(100, state.startH + dy)}px`;
          if (d.includes("n")) {
            const h = Math.max(100, state.startH - dy);
            s.height = `${h}px`;
            s.top = `${state.startT + (state.startH - h)}px`;
          }

          // Horizontal
          if (d.includes("e"))
            s.width = `${Math.max(200, state.startW + dx)}px`;
          if (d.includes("w")) {
            const w = Math.max(200, state.startW - dx);
            s.width = `${w}px`;
            s.left = `${state.startL + (state.startW - w)}px`;
          }
        }
      },
      { signal },
    );

    // 3. Mouse Up (End Action)
    document.addEventListener(
      "mouseup",
      () => {
        if (state.isDragging || state.isResizing) {
          state.isDragging = false;
          state.isResizing = false;
          toggleFrames(true); // Re-enable iframes
        }
      },
      { signal },
    );

    return controller;
  }
}
