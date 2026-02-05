export class WindowManager {
  constructor() {
    this.windows = [];
    this.activeWindowId = null;
    this.zIndexCounter = 100;
    this.desktopContainer = document.getElementById("desktop-container");
  }

  openWindow(appConfig) {
    const id = `win-${Date.now()}`;

    const windowEl = this.createWindowDOM(id, appConfig);

    this.desktopContainer.appendChild(windowEl);
    this.windows.push({ id, ...appConfig, element: windowEl });

    this.focusWindow(id);
  }

  closeWindow(id) {
    const winIdx = this.windows.findIndex((w) => w.id === id);
    if (winIdx > -1) {
      const win = this.windows[winIdx];
      win.element.remove();
      this.windows.splice(winIdx, 1);
    }
  }

  focusWindow(id) {
    const win = this.windows.find((w) => w.id === id);
    if (win) {
      this.zIndexCounter++;
      win.element.style.zIndex = this.zIndexCounter;

      this.windows.forEach((w) => w.element.classList.remove("active"));
      win.element.classList.add("active");
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
                    <img src="${config.img_src}" width="16">
                    <span>${config.name}</span>
                </div>
                <div class="controls">
                    <button class="btn-min">_</button>
                    <button class="btn-max">□</button>
                    <button class="btn-close">X</button>
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

    return el;
  }
}
