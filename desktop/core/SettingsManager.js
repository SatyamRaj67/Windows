export const Settings = {
  get(key, defaultValue) {
    return localStorage.getItem(key) || defaultValue;
  },
  set(key, value) {
    localStorage.setItem(key, value);
    this.apply(key, value);
  },
  apply(key, value) {
    if (key === "theme") {
      document.body.setAttribute("data-theme", value);
    }
  },
};
