export class WindowManager {
  // ===   CONSTRUCTOR    ===

  // Windows: [{
  //  id: string,
  // name: string,
  // img_src: string,
  // }]
  constructor() {
    this.windows = new Map();
    this.zIndex = 100;
    this.desktop = document.getElementById("desktop-container");
    this.taskbar = document.getElementById("taskbar-app-tray");
  }

  openWindow(app) {
    if (this.windows.has(app.id)) {
      this.focusWindow(app.id);
      return;
    }

    // === Create Window DOM ===
    const winEl = this.createWindowDOM(app);
    this.desktop.appendChild(winEl);

    // === Handle Taskbar Icons ===
    let taskbarItem = this.taskbar.querySelector(`li[data-id="${app.id}"]`);
    let isTemp = false;

    if (!taskbarItem) {
      taskbarItem = this.createTaskbarDOM(app);
      this.taskbar.appendChild(taskbarItem);
      isTemp = true;
    }

    taskbarItem.classList.add("open");

    this.windows.set(app.id, {
      element: winEl,
      taskbarElement: taskbarItem,
      isTemp: isTemp,
      controller: winEl._controller,
    });

    this.focusWindow(app.id);
  }

  closeWindow(id) {
    // === Find Window ===
    const win = this.windows.get(id);
    if (!win) return;

    if (win.controller) {
      win.controller.abort();
    }

    // === Remove Window DOM ===
    win.element.remove();

    // === Handle Taskbar Icon ===
    win.taskbarElement.classList.remove("open");
    win.taskbarElement.classList.remove("active");
    if (win.isTemp) {
      win.taskbarElement.remove();
    }

    // === Remove from Window Manager ===
    this.windows.delete(id);
  }

  focusWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    // === Bring to Front ===
    this.zIndex++;
    win.element.style.zIndex = this.zIndex;
    win.element.style.display = "block";

    // === Visual Indicator of the focused window ===
    document
      .querySelectorAll(".window-frame")
      .forEach((w) => w.classList.remove("active"));
    win.element.classList.add("active");

    // === Focus Taskbar Icon ===
    document
      .querySelectorAll(".app")
      .forEach((app) => app.classList.remove("active"));
    win.taskbarElement.classList.add("active");
  }

  toggleWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    if (win.element.classList.contains("minimized")) {
      this.focusWindow(id);
      win.element.classList.remove("minimized");
    } else if (win.element.classList.contains("active")) {
      win.element.classList.add("minimized");
      win.element.classList.remove("active");
      win.taskbarElement.classList.remove("active");
    } else {
      this.focusWindow(id);
    }
  }

  maximizeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    if (win.element.classList.contains("maximized")) {
      win.element.classList.remove("maximized");
    } else {
      win.element.classList.add("maximized");
    }
  }

  minimizeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    if (!win.element.classList.contains("minimized")) {
      win.element.classList.add("minimized");
      win.element.classList.remove("active");
      win.taskbarElement.classList.remove("active");
    }
  }

  // === Windows Generator Functions ===
  createWindowDOM(app) {
    const el = document.createElement("div");

    el.classList.add("window-frame");
    el.classList.add(app.img_src.includes("Notepad") ? "notepad" : "app");

    el.style.left = "100px";
    el.style.top = "50px";
    el.style.width = "400px";
    el.style.height = "300px";
    el.innerHTML = `
            <div class="title-bar">
                <div class="title">
                <div class="imgBx">
                  <img class="icon">
                </div>
                    <span class="title-text"></span>
                </div>
                <div class="controls">
                    <button class="min"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus-icon lucide-minus"><path d="M5 12h14"/></svg></button>
                    <button class="max"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-icon lucide-square"><rect width="18" height="18" x="3" y="3" rx="2"/></svg></button>
                    <button class="close"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                </div>
            </div>
            <div class="window-content">
                <p contenteditable="${app.img_src.includes("Notepad") ? "true" : "false"}">${app.content}</p>
            </div>
        `;

    // === Set App Icon ===
    const img = el.querySelector(".icon");
    img.src = app.img_src;
    img.alt = app.name;

    el.querySelector(".title-text").textContent = app.name;

    // === Internal Mouse Events ===
    el.addEventListener("mousedown", () => this.focusWindow(app.id));

    el.querySelector(".close").addEventListener("click", () => {
      this.closeWindow(app.id);
    });

    el.querySelector(".max").addEventListener("click", () => {
      this.maximizeWindow(app.id);
    });

    el.querySelector(".min").addEventListener("click", () => {
      this.minimizeWindow(app.id);
    });

    const controller = this.makeDraggable(el, el.querySelector(".title-bar"));
    el._controller = controller;
    return el;
  }

  createTaskbarDOM(app) {
    const li = document.createElement("li");
    li.classList.add("app");
    li.dataset.id = app.id;
    li.innerHTML = `
      <img src="${app.img_src}" alt="${app.name}" />
    `;
    li.addEventListener("click", () => {
      this.toggleWindow(app.id);
    });

    return li;
  }

  makeDraggable(el, handle) {
    let isDown = false;
    let offset = [0, 0];
    const controller = new AbortController();

    handle.addEventListener(
      "mousedown",
      (e) => {
        isDown = true;
        offset = [el.offsetLeft - e.clientX, el.offsetTop - e.clientY];
      },
      { signal: controller.signal },
    );

    document.addEventListener(
      "mouseup",
      () => {
        isDown = false;
      },
      { signal: controller.signal },
    );

    document.addEventListener(
      "mousemove",
      (e) => {
        if (isDown) {
          el.style.left = e.clientX + offset[0] + "px";
          el.style.top = e.clientY + offset[1] + "px";
        }
      },
      { signal: controller.signal },
    );

    return controller;
  }
}
