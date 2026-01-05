import { writeFile as XlsxWriteFile, utils as XlsxUtils } from "xlsx";

export default function main() {
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

  const style = {
    default: {
      backgroundColor: "#10438F",
      color: "white",
    },
    button: {
      padding: "0.5rem 1rem",
      backgroundColor: "#10438F",
      color: "white",
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
  const nustools__toolbar = (): HTMLDivElement =>
    document.querySelector(".k-grid-toolbar")!;
  const nustools__studentCard = (): HTMLTableElement =>
    document.querySelector("table#studentcard")!;
  const nustools__cardImage = (): HTMLTableElement =>
    document.querySelector("#studentcard .person-image img")!;
  const nustools__surveyTable = (): HTMLTableElement =>
    document.querySelector("#tblSER_CourseGroup_SurveyQuestion_Student")!;

  // const boxHeaderEl = document.querySelectorAll(".box-header")[1];
  // console.log("boxHeader:", boxHeaderEl);

  const downloadButton = document.createElement("button");
  downloadButton.textContent = "دانلود فایل اکسل";
  assignStyle(downloadButton, style.button);
  downloadButton.style.setProperty("font-size", "18px", "important");
  downloadButton.addEventListener("click", () =>
    XlsxWriteFile(XlsxUtils.table_to_book(nustools__table()), "nustools.xlsx")
  );

  const sendToNusButton = document.createElement("button");
  sendToNusButton.textContent = "ارسال به NUSTools";
  assignStyle(sendToNusButton, style.button);
  sendToNusButton.style.setProperty("font-size", "18px", "important");
  sendToNusButton.addEventListener("click", () =>
    alert("این قابلیت در دست توسعه است.")
  );

  const surveySelectAllRow = document.createElement("tr");
  surveySelectAllRow.style.display = "table-row";
  surveySelectAllRow.style.setProperty("font-size", "18px", "important");
  surveySelectAllRow.innerHTML = `
  <th style="display:none">*</th>
  <th style="width:30px; padding-right:5px; text-align:center;">*</th>
  <th style="width:400px; padding-right:5px;">
    پرکردن خودکار (NUSTools)
  </th>

  ${[8, 7, 6, 5, 4, 3, 2, 1]
    .map(
      (n) => `
        <th style="text-align:center;">
          <p
            id="SurveyQuestionID_0_${n}"
            style="cursor:pointer"
          >
            ${n}
          </p>
        </th>
      `
    )
    .join("")}
`;
  assignStyle(surveySelectAllRow);

  // ! NUSTools Extension Error: TypeError: Cannot read properties of null (reading 'getAttribute')
  // ? Node cannot be found in the current page. (formId console.log)
  // * Make sure to enable "Preserve Log" option
  // static isTimeTable() {
  //   const formId = document.querySelector("form#frm");
  //   console.log("formid:", formId);
  //   if (formId.getAttribute("action") === "/SER_Enroll_Student/Post")
  //     return true;
  //   else false;
  // }

  // const isTimeTable = NUSTools.isTimeTable();
  // if (boxHeaderEl && isTimeTable)
  //   Object.assign(boxHeaderEl.style, {
  //     display: "flex",
  //     gap: "1rem",
  //   });

  if (nustools__grid()?.value === "SER_Course_For_Student") {
    let toolbar = nustools__toolbar();
    toolbar.innerHTML = "";
    toolbar.style.gap = "1rem";
    toolbar.appendChild(downloadButton);
    toolbar.appendChild(sendToNusButton);
  }

  waitForDocument(() => {
    if (nustools__studentCard()) {
      alert("student card");
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
      let tbody = nustools__surveyTable().querySelector("tbody")!;
      tbody.prepend(surveySelectAllRow);

      surveySelectAllRow
        .querySelectorAll("input[type='checkbox']")
        .forEach((item) =>
          item.addEventListener("click", () => {
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
