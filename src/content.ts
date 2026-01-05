import main from "./main";

try {
  chrome.runtime.sendMessage({
    action: "injectPageScript",
    file: "page_inject.js",
  });
} catch (e) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("page_inject.js");
  script.onload = () => script.remove();
  (document.head || document.documentElement).prepend(script);
}

window.addEventListener("message", (event) => {
  if (!event.data || !event.data.__nustools) return;
  else main();
});
