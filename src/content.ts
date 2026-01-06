import { writeFile as XlsxWriteFile, utils as XlsxUtils } from "xlsx";

function main() {
  const waitForDocument = (callback: () => void) => {
    const bodyObserver = new MutationObserver(() => {
      const el = document.querySelector("body");
      if (el) {
        bodyObserver.disconnect();
        callback();
      }
    });
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };

  const style: Record<string, Partial<CSSStyleDeclaration>> = {
    default: {
      backgroundColor: "#10438F",
      color: "white",
      userSelect: "none",
    },
    button: {
      backgroundColor: "#10438F",
      color: "white",
      userSelect: "none",
      padding: "0.5rem 1rem",
      border: "none",
      borderRadius: "10px",
    },
  };

  const assignStyle = (element: HTMLElement, styleObject = style.default) =>
    Object.assign(element?.style, styleObject);

  const nustools__table = (): HTMLTableElement =>
    document.querySelector("table.k-selectable[role='grid']")!;
  const nustools__grid = (): HTMLInputElement =>
    document.querySelector("input[type='hidden']#gridmodelname")!;
  const nustools__gridToolbar = (): HTMLDivElement =>
    document.querySelector(".k-grid-toolbar")!;
  const nustools__studentCard = (): HTMLTableElement =>
    document.querySelector("table#studentcard")!;
  const nustools__cardImage = (): HTMLTableElement =>
    document.querySelector("#studentcard .person-image img")!;
  const nustools__surveyTable = (): HTMLTableElement =>
    document.querySelector("#tblSER_CourseGroup_SurveyQuestion_Student")!;
  const nustools__timetable = () =>
    document.querySelector("input[type='hidden']#SelectedSER_CourseGroupIDs");

  const nustools__createbutton = () => {
    let button = document.createElement("button");
    assignStyle(button, style.button);
    button.style.setProperty("font-size", "18px", "important");

    return button;
  };

  waitForDocument(() => {
    if (nustools__timetable()) {
      const header = document.querySelector(
        "#frm > div.col-lg-12.col-md-12.col-sm-12.col-xs-12 > div > div > div > div.box-header"
      )! as HTMLElement;
      Object.assign(header.style, {
        display: "flex",
        gap: "1rem",
      });

      const tbody = document.querySelector(
        "#frm > div.col-lg-12.col-md-12.col-sm-12.col-xs-12 > div > div > div > div.page > div > table > tbody"
      )!;

      const copyTimeTable = nustools__createbutton();
      copyTimeTable.textContent = "کپی جدول زمانی";
      copyTimeTable.addEventListener("click", (e) => {
        e.preventDefault();
        let firstElement = tbody.firstElementChild!;
        firstElement.setAttribute("hidden", "true");
        navigator.clipboard.writeText(tbody.textContent).then(() => {
          alert("کپی شد");
          firstElement.removeAttribute("hidden");
        });
      });

      const sendToNusButton = nustools__createbutton();
      sendToNusButton.textContent = "ارسال به NUSTools";
      sendToNusButton.addEventListener("click", (e) => {
        e.preventDefault();
        alert("این قابلیت در دست توسعه است.");
      });

      header.appendChild(copyTimeTable);
      header.appendChild(sendToNusButton);
    }
  });

  waitForDocument(() => {
    if (nustools__grid()?.value === "SER_Course_For_Student") {
      let toolbar = nustools__gridToolbar();
      toolbar.innerHTML = "";
      toolbar.style.gap = "1rem";

      const downloadButton = nustools__createbutton();
      downloadButton.textContent = "دانلود فایل اکسل";
      downloadButton.addEventListener("click", (e) => {
        e.preventDefault();
        XlsxWriteFile(
          XlsxUtils.table_to_book(nustools__table()),
          "nustools.xlsx"
        );
      });

      const sendToNusButton = nustools__createbutton();
      sendToNusButton.textContent = "ارسال به NUSTools";
      sendToNusButton.addEventListener("click", (e) =>
        alert("این قابلیت در دست توسعه است.")
      );

      toolbar.appendChild(downloadButton);
      toolbar.appendChild(sendToNusButton);
    }
  });

  waitForDocument(() => {
    if (nustools__studentCard()) {
      nustools__cardImage().style.setProperty(
        "aspect-ratio",
        "3/4",
        "important"
      );
      nustools__cardImage().style.setProperty("height", "unset", "important");
    }
  });

  waitForDocument(() => {
    if (nustools__surveyTable()) {
      const surveySelectAllRow = document.createElement("tr");
      surveySelectAllRow.style.display = "table-row";
      surveySelectAllRow.style.height = "40px";
      surveySelectAllRow.style.setProperty("font-size", "18px", "important");
      surveySelectAllRow.innerHTML = `
  <th style="width:30px;text-align:center;vertical-align:bottom;">*</th>
  <th style="width:400px;text-align:center">
    پرکردن خودکار (افزونه NUSTools)
  </th>

  ${[8, 7, 6, 5, 4, 3, 2, 1]
    .map(
      (n) => `
        <th style="text-align:center;">
          <p
            id="SurveyQuestionID_0_${n}"
            style="cursor:pointer;margin:auto 0;"
            role="selectall"
          >
            ${n}
          </p>
        </th>
      `
    )
    .join("")}
`;
      assignStyle(surveySelectAllRow);

      let tbody = nustools__surveyTable().querySelector("tbody")!;
      tbody.lastElementChild?.remove();
      tbody.prepend(surveySelectAllRow);

      surveySelectAllRow
        .querySelectorAll("p[role='selectall']")
        .forEach((item) =>
          item.addEventListener("click", (e) => {
            e.preventDefault();
            const score = item.id.split("")[item.id.length - 1];
            for (let i = 1; i < 50; i++) {
              const checkbox = document.getElementById(
                `SurveyQuestionID_${i}_${score}`
              );
              if (checkbox) checkbox.click();
            }
          })
        );
    }
  });
}

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
