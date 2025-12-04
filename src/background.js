chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message || message.action !== "injectPageScript") return;

  const tabId = sender?.tab?.id;
  if (!tabId) return;

  console.debug(
    "NUSTools: injectPageScript requested for tab",
    tabId,
    message.file
  );

  try {
    const fileUrl = chrome.runtime.getURL(message.file || "page_inject.js");

    chrome.scripting
      .executeScript({
        target: { tabId },
        func: (fileUrlArg) => {
          try {
            const s = document.createElement("script");
            s.src = fileUrlArg;
            (document.head || document.documentElement).prepend(s);
            s.onload = () => s.remove();
          } catch (e) {}
        },
        args: [fileUrl],
        world: "MAIN",
      })
      .then((results) => {
        console.debug("NUSTools injection result", results);
      })
      .catch((err) => {
        console.error("NUSTools Failed to inject page script:", err);
      });
  } catch (err) {
    console.error("NUSTools Failed to inject page script (sync):", err);
  }
});
