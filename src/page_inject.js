(() => {
  if (window.__nustools_injected) return;
  window.__nustools_injected = true;

  try {
    console.log("%c[NUSTools] loaded", "color: #00ff99");
  } catch (e) {}

  try {
    const orgFetch = window.fetch;
    window.fetch = async function (...args) {
      try {
        const url = args[0];
        window.postMessage({ __nustools: true, type: "fetch", url }, "*");
      } catch (e) {}
      return orgFetch.apply(this, args);
    };
  } catch (e) {}

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
  } catch (e) {}

  try {
    window.testfetch = () =>
      fetch("https://api.8.alialmasi.ir/v1/answers")
        .then((res) => res.json())
        .then((res) => console.log(res.status));
  } catch (e) {}
})();
