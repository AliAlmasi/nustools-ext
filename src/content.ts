//#region Imported modules
import { writeFile as XlsxWriteFile, utils as XlsxUtils } from "xlsx";
import { toPng } from "html-to-image";
import { Options as screenshotOptions } from "html-to-image/lib/types";
//#endregion

/**
 * Main function of the extension. Used at the event listener for fetches happening on the page.
 */
function main(): void {
  //#region Variables and functions for styling

  /**
   * This object is used to store all the style objects' we wanna use.
   */
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

  /**
   * This function is used to assign and apply style objects to HTML elements.
   * @param element Element Which the styles will be assigned to.
   * @param styleObject Object of styles which will be assigned to the element. If not defined, the default style object will be assigned.
   */
  const assignStyle = (element: HTMLElement, styleObject = style.default) =>
    Object.assign(element?.style, styleObject);

  /**
   * This function is used to assign the aspect ratio of 3x4 on the input element.
   * @param element Element which the aspect ratio will be set to 3x4.
   */
  const aspectRatioFix = (element: HTMLElement) => {
    element?.style.setProperty("height", "unset", "important");
    element?.style.setProperty("aspect-ratio", "3/4", "important");
  };

  //#endregion

  //#region Utility functions

  /**
   * This function is used for executing codes (inside the callback function) as soon as the page mutates.
   * @param callback Function which will be executed whenever a mutation observed.
   */
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

  /**
   *
   * @param element Element which the screenshot will be taken from
   * @param filename
   * @param options
   */
  const screenshot = (
    element: HTMLElement,
    filename: string,
    options?: Partial<screenshotOptions>
  ) => {
    toPng(
      element,
      Object.assign(
        {
          backgroundColor: "white",
          quality: 1,
          pixelRatio: 3,
        },
        options
      )
    ).then((data) => {
      const link = document.createElement("a");
      link.download = filename;
      link.href = data;
      link.click();
    });
  };

  /**
   * This function creates a button element with the custom `button` styles assigned.
   * @returns The created button element.
   */
  const nustools__createbutton = (textContent = ""): HTMLButtonElement => {
    const button = document.createElement("button");
    button.textContent = textContent;
    assignStyle(button, style.button);
    button.style.setProperty("font-size", "18px", "important");
    return button;
  };

  //#endregion

  //#region Elements used from Bustan

  const nustools__table = (): HTMLTableElement =>
    document.querySelector("table.k-selectable[role='grid']")!;
  const nustools__grid = (): HTMLInputElement =>
    document.querySelector("input[type='hidden']#gridmodelname")!;
  const nustools__gridToolbar = (): HTMLDivElement =>
    document.querySelector(".k-grid-toolbar")!;
  const nustools__studentCard = (): HTMLTableElement =>
    document.querySelector(
      "#divContainer > div:nth-child(4)[align='center']:has(table#studentcard)"
    )!;
  const nustools__cardImage = (): HTMLTableElement =>
    document.querySelector("#studentcard .person-image img")!;
  const nustools__surveyTable = (): HTMLTableElement =>
    document.querySelector("#tblSER_CourseGroup_SurveyQuestion_Student")!;
  const nustools__timetable = (): HTMLInputElement =>
    document.querySelector("input[type='hidden']#SelectedSER_CourseGroupIDs")!;
  const nustools__examCard = (): HTMLDivElement =>
    document.querySelector(
      "#divContainer > div:nth-child(5)[align='center']:not([class])"
    )!;
  const nustools__boxHeader = (): HTMLDivElement =>
    document.querySelector("#divContainer > div.box-header")!;

  //#endregion

  //#region منو پروفایل بالای صفحه
  function addDropdownItems(): void {
    const dropdown = document.querySelector(
      "div.dropdown-menu > ul.list-unstyled"
    );
    if (dropdown) {
      if (dropdown.querySelector("div#added-by-nustools-ext")) return;
      const element = document.createElement("div");
      element.id = "added-by-nustools-ext";
      element.innerHTML = `
        <li>
            <a href="https://nustools.ir" class="dropdown-item" target="_blank">
                <i id="mfa" class="fa fa-bolt"></i>
                ابزار های بوستان (NUSTools)
            </a>
        </li>
        <li>
            <a href="#https://nustools.ir/extension/help/update" class="dropdown-item" target="_blank">
                <i id="mfa" class="fa fa-puzzle-piece"></i>
                بروزرسانی افزونه (NUSTools)
            </a>
        </li>
      `;

      dropdown.append(element);
    }
  }
  //#endregion

  //#region صفحه چاپ انتخاب واحد
  function CoursesViewPage(): void {
    const header = document.querySelector(
      "#frm > div.col-lg-12.col-md-12.col-sm-12.col-xs-12 > div > div > div > div.box-header"
    )! as HTMLElement;
    header.innerHTML = "";
    Object.assign(header.style, {
      display: "flex",
      gap: "1rem",
    });

    const tbody = document.querySelector(
      "#frm > div.col-lg-12.col-md-12.col-sm-12.col-xs-12 > div > div > div > div.page > div > table > tbody"
    )!;

    const copyTimeTable = nustools__createbutton("کپی جدول زمانی");
    copyTimeTable.addEventListener("click", (e) => {
      e.preventDefault();
      const firstElement = tbody.firstElementChild!;
      const temp = firstElement.innerHTML;
      firstElement.innerHTML = "";
      navigator.clipboard.writeText(tbody.textContent).then(() => {
        alert("کپی شد");
        firstElement.innerHTML = temp;
      });
    });

    const downloadExcel = nustools__createbutton("دانلود فایل اکسل");
    downloadExcel.addEventListener("click", (e) => {
      e.preventDefault();
      XlsxWriteFile(
        XlsxUtils.table_to_book(tbody),
        "timetable_bustan.nustools.xlsx"
      );
    });

    const sendToNusButton = nustools__createbutton(
      "ارسال به برنامه‌ساز NUSTools"
    );
    sendToNusButton.addEventListener("click", (e) => {
      e.preventDefault();
      alert("این قابلیت در دست توسعه است.");
    });

    header.appendChild(copyTimeTable);
    header.appendChild(downloadExcel);
    header.appendChild(sendToNusButton);
  }
  //#endregion

  //#region صفحه گروه‌های درسی
  function CoursesPage(): void {
    const toolbar = nustools__gridToolbar();
    toolbar.innerHTML = "";
    toolbar.style.gap = "1rem";

    const downloadButton = nustools__createbutton("دانلود فایل اکسل");
    downloadButton.addEventListener("click", (e) => {
      e.preventDefault();
      XlsxWriteFile(
        XlsxUtils.table_to_book(nustools__table()),
        "course_groups_bustan.nustools.xlsx"
      );
    });

    const sendToNusButton = nustools__createbutton(
      "ارسال به پیش‌انتخاب واحد NUSTools"
    );
    sendToNusButton.addEventListener("click", (e) =>
      alert("این قابلیت در دست توسعه است.")
    );

    toolbar.appendChild(downloadButton);
    toolbar.appendChild(sendToNusButton);
  }
  //#endregion

  //#region صفحه کارت دانشجویی
  function StudentCardPage(): void {
    nustools__boxHeader().innerHTML = "";
    nustools__studentCard().style.margin = "0";
    nustools__studentCard().style.width = "fit-content";
    nustools__studentCard().style.padding = "2rem";

    const downloadImage = nustools__createbutton("دانلود عکس کارت");
    downloadImage.addEventListener("click", () =>
      screenshot(nustools__studentCard(), "student-card_bustan.nustools.png", {
        pixelRatio: 2.5,
      })
    );

    nustools__boxHeader().append(downloadImage);

    (
      nustools__studentCard().querySelector("table#studentcard") as HTMLElement
    ).style.width = "fit-content";

    const tr = nustools__studentCard().querySelector(
      "table#studentcard > tbody > tr"
    )! as HTMLElement;
    assignStyle(tr, {
      display: "flex",
      flexDirection: "column-reverse",
    });

    assignStyle(tr.firstElementChild as HTMLElement, {
      borderLeft: "0",
      borderTop: "3px solid #0e0101",
    });

    nustools__studentCard()
      .querySelectorAll(".column")
      .forEach((item, i) => {
        (item as HTMLElement).style.setProperty(
          "font-size",
          "12px",
          "important"
        );

        if (i === 0) {
          (item.querySelector("div.barcode") as HTMLElement).style.paddingTop =
            "unset";
        }

        if (i === 1) {
          const detailsChildren = item.querySelector("div.details")?.children!;
          for (let i = 0; i < detailsChildren?.length; i++) {
            const detailsItem = detailsChildren[i] as HTMLElement;
            detailsItem.style.paddingTop = "0.5px";
            detailsItem.style.fontSize = "unset";
          }
        }
      });

    aspectRatioFix(nustools__cardImage());

    (
      nustools__studentCard().querySelector("div.qr-code") as HTMLElement
    ).style.top = "125px";
  }
  //#endregion

  //#region صفحه نظرسنجی استادان
  function SurveyPage(): void {
    const surveySelectAllRow = document.createElement("tr");
    surveySelectAllRow.style.display = "table-row";
    surveySelectAllRow.style.height = "40px";
    surveySelectAllRow.style.setProperty("font-size", "18px", "important");

    surveySelectAllRow.innerHTML = `
        <th style="width:30px;text-align:center;vertical-align:bottom;">*</th>
        <th style="width:400px;text-align:center">
          پرکردن خودکار (افزونه NUSTools)
          <span style="font-size:14px">روی اعداد کلیک کنید</span>
        </th>

        ${[8, 7, 6, 5, 4, 3, 2, 1]
          .map(
            (n) => `
              <th style="text-align:center;">
                <p
                  id="SurveyQuestionID_0_${n}"
                  style="cursor:pointer;margin:auto 0;height:100%"
                >${n}</p>
              </th>
            `
          )
          .join("")}
        `;

    assignStyle(surveySelectAllRow);

    const tbody = nustools__surveyTable().querySelector("tbody")!;
    tbody.lastElementChild?.remove();
    tbody.prepend(surveySelectAllRow);

    surveySelectAllRow
      .querySelectorAll("p[id*='SurveyQuestionID_0']")
      .forEach((element) =>
        element.addEventListener("click", (e) => {
          e.preventDefault();
          const score = element.id.split("")[element.id.length - 1];
          for (let i = 1; i < 50; i++) {
            const checkbox = document.getElementById(
              `SurveyQuestionID_${i}_${score}`
            );
            if (checkbox) checkbox.click();
          }
        })
      );
  }
  //#endregion

  //#region صفحه کارت امتحانات
  function ExamCardPage(): void {
    assignStyle(nustools__examCard(), {
      width: "fit-content",
      padding: "2rem",
    });

    const downloadImage = nustools__createbutton("دانلود کارت امتحانات");
    downloadImage.addEventListener("click", () =>
      screenshot(nustools__examCard(), "exam-card_bustan.nustools.png")
    );

    nustools__boxHeader().style.marginBottom = "2rem";
    nustools__boxHeader().innerHTML = "";
    nustools__boxHeader().append(downloadImage);

    const examCardChildren = nustools__examCard()?.children!;

    for (let i = 0; i < examCardChildren.length; i++) {
      const item = examCardChildren[i] as HTMLElement;
      item.style.fontSize = "16px";
      item.style.width = "unset";
      item.style.maxWidth = "800px";

      if (i === 1) {
        const image = item.querySelector("img") as HTMLImageElement;
        aspectRatioFix(image);
        image.style.height = "100%";
        image.style.width = "100px";
      }

      if (i === 2) {
        item.style.setProperty("font-size", "12px", "important");
        item
          .querySelectorAll("tbody > * > *")
          .forEach((cell) => ((cell as HTMLElement).style.padding = "5px"));

        item
          .querySelectorAll("tbody > tr > td:nth-child(3)")
          .forEach((item) => item.remove());

        item
          .querySelectorAll("tbody > tr > td:nth-child(10)")
          .forEach((item) => item.remove());
      }

      if (i === 3) {
        item.style.setProperty("display", "none", "important");
      }
    }
  }
  //#endregion

  //#region Observing the document for changes,
  // then deciding what do to based on the elements of the page.
  waitForDocument(() => {
    addDropdownItems();

    if (nustools__timetable()) CoursesViewPage();

    if (nustools__grid()?.value === "SER_Course_For_Student") CoursesPage();

    if (nustools__studentCard()) StudentCardPage();

    if (nustools__surveyTable()) SurveyPage();

    if (nustools__examCard()) ExamCardPage();
  });
  //#endregion
}

//#region Trying to inject the `page_inject.js` file via prepending a `script` tag with the file as the `src`.
chrome.runtime.sendMessage(
  {
    action: "injectPageScript",
    file: "page_inject.js",
  },
  () => {
    if (chrome.runtime.lastError) {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("page_inject.js");
      script.onload = () => script.remove();
      (document.head || document.documentElement).prepend(script);
    }
  }
);

//#endregion

//#region This is the event listener for fetches on the page. Check `page_inject.js` file.
window.addEventListener("message", (event) => {
  if (!event.data || !event.data.__nustools) return;
  else main();
});
//#endregion
