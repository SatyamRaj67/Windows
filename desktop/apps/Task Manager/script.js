// ==========================
// ===         Performance Graph          ===
// ==========================

class PerformanceGraph {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.data = [];
    this.maxDataPoints = 60; // 60 seconds history
    this.canvasWidth = 100; // SVG coordinate system width (abstract units)
    this.canvasHeight = 100; // SVG coordinate system height (abstract units)

    this.initSVG();
    this.startMonitoring();
  }

  initSVG() {
    // Create SVG element
    // Using preserveAspectRatio="none" simply stretches the 100x100 coord system to fill the container
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute(
      "viewBox",
      `0 0 ${this.canvasWidth} ${this.canvasHeight}`,
    );
    this.svg.setAttribute("preserveAspectRatio", "none");

    // Create path for the area (filled under the line)
    this.areaPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    this.areaPath.classList.add("chart-area");

    // Create path for the line
    this.linePath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    this.linePath.classList.add("chart-line");

    this.svg.appendChild(this.areaPath);
    this.svg.appendChild(this.linePath);
    this.container.appendChild(this.svg);

    // Fill initial data with zeros so the graph starts flat
    for (let i = 0; i < this.maxDataPoints; i++) {
      this.data.push(0);
    }
  }

  // Generate a Smooth path string from data points
  generatePathData(closeArea = false) {
    // Map data to SVG coordinates
    // X goes from 0 to 100
    // Y goes from 100 (bottom) to 0 (top) based on value (0-100)

    const step = this.canvasWidth / (this.maxDataPoints - 1);

    let pathD = "";

    this.data.forEach((value, index) => {
      const x = index * step;
      // Invert Y because SVG coordinates start at top-left
      const y = this.canvasHeight - (value / 100) * this.canvasHeight;

      if (index === 0) {
        pathD += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
      } else {
        pathD += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      }
    });

    if (closeArea) {
      // Close the path for the filled area: go to bottom right, then bottom left
      pathD += ` L ${this.canvasWidth} ${this.canvasHeight}`;
      pathD += ` L 0 ${this.canvasHeight}`;
      pathD += " Z";
    }

    return pathD;
  }

  updateGraph() {
    // Shift data: remove old, add new
    // Simulating data fluctuation
    const prevValue = this.data[this.data.length - 1];
    let change = (Math.random() - 0.5) * 30; // Change by up to +/- 15

    // Add occasional spikes
    if (Math.random() > 0.95) change += 40;

    let newValue = prevValue + change;

    // Clamp between 0 and 100
    newValue = Math.max(0, Math.min(100, newValue));

    this.data.shift();
    this.data.push(newValue);

    // Update display value
    const display = document.getElementById("cpu-value");
    if (display) display.textContent = `${Math.round(newValue)}%`;

    // Update SVG paths
    this.linePath.setAttribute("d", this.generatePathData(false));
    this.areaPath.setAttribute("d", this.generatePathData(true));
  }

  startMonitoring() {
    // Update frequency
    setInterval(() => this.updateGraph(), 1000);
    this.updateGraph(); // Initial drawing
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new PerformanceGraph("cpu-chart");
});

// =========================
// === UI IMPLEMENTATIONS          ===
// =========================
const menuItem = document.querySelector("aside ul li:first-child");
const aside = document.querySelector("aside");

const asideItems = aside.querySelectorAll("ul li:not(:first-child)");

menuItem.addEventListener("click", () => {
  aside.classList.toggle("collapsed");
});

asideItems.forEach((item) => {
  item.addEventListener("click", () => {
    asideItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");
  });
});
