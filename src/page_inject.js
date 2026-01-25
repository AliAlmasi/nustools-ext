(() => {
  //#region INJECT STATE CHECK
  try {
    if (window.__nustools_injected) return;
    window.__nustools_injected = true;
  } catch (error) {
    console.error("Error while checking for inject state:", error);
  }
  //#endregion

  //#region INJECTING MANIPULATED FETCH
  try {
    const orgFetch = window.fetch;
    window.fetch = async function (...args) {
      try {
        const url = args[0];
        window.postMessage({ __nustools: true, type: "fetch", url }, "*");
      } catch (e) {}
      return orgFetch.apply(this, args);
    };
  } catch (e) {
    console.error("Error while injecting fetch:", e);
  }
  //#endregion

  //#region INJECTING MANIPULATED XHR
  try {
    const orgXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (...args) {
      try {
        const method = args[0];
        const url = args[1];
        window.postMessage({ __nustools: true, type: "xhr", method, url }, "*");
      } catch (e) {}

      return orgXhrOpen.apply(this, args);
    };
  } catch (e) {
    console.error("Error while injecting xhr:", e);
  }
  //#endregion
})();
