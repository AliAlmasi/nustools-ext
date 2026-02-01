// function newtab(href) {
//   const a = document.createElement("a");
//   a.href = href;
//   a.setAttribute("target", "_blank");
//   a.click();
//   a.remove();
// }

document.addEventListener("contextmenu", (e) => e.preventDefault());

const currentVersion = chrome.runtime.getManifest().version;

document.addEventListener(
  "DOMContentLoaded",
  () => (document.getElementById("version").textContent = currentVersion),
);

// const updateButton = document.getElementById("update");

// const showLatestVersionMessage = () => {
//   const oldTextContent = updateButton.textContent;
//   updateButton.textContent = "نیازی نیست :)";
//   updateButton.setAttribute("disabled", "true");
//   console.log("clicked");

//   setTimeout(() => {
//     updateButton.textContent = oldTextContent;
//     updateButton.removeAttribute("disabled");
//   }, 2 * 1000);
// };

// updateButton.addEventListener("click", () => {
//   const latestVersion = "v0.0.7"; // fetch from github latest tag
//   if (currentVersion === latestVersion) showLatestVersionMessage();
//   else newtab("https://github.com/alialmasi/nustools-ext/releases/latest");
// });
