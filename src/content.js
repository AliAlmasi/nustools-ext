const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const [url, options] = args;

  try {
    if (typeof url === "string" && url.includes("bustan.nus.ac.ir")) {
      console.log(
        "%c[Bustan Fetch Listener]",
        "color: #00ff99",
        "Detected fetch →",
        url
      );
      console.log("Options:", options);
    }
  } catch (err) {
    console.warn("Error in fetch listener:", err);
  }

  return originalFetch.apply(this, args);
};

const origOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (...args) {
  const [method, url] = args;
  if (
    url &&
    (url.includes("bustan.nus.ac.ir") ||
      url.includes("127.0.0.1") ||
      url.includes("localhost"))
  ) {
    console.log(
      "%c[Bustan Fetch Listener]",
      "color: #00ff99",
      `XHR → ${method} ${url}`
    );
  }
  return origOpen.apply(this, args);
};

console.log("%c[Bustan Fetch Listener active]", "color: #00ff99");
