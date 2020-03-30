(function() {
  if (this.globalThis !== this)
    Object.defineProperty(this, "globalThis", {
      value: this,
      writable: true,
      configurable: true,
    });
})();
