//#region Imported modules
import { writeFile as XlsxWriteFile, utils as XlsxUtils } from "xlsx";
import { toPng } from "html-to-image";
import { Options as ScreenshotOptions } from "html-to-image/lib/types";
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
    text: {
      color: "#10438F",
      fontWeight: "700",
      fontSize: "16px",
      userSelect: "none",
    },
    label: {
      border: "1px solid #10438F",
      padding: "3px 6px",
      borderRadius: "5px",
    },
  };

  /**
   * This function is used to assign and apply style objects to HTML elements.
   * @param element Element Which the styles will be assigned to.
   * @param styleObjects Array of styleobjects which will be assigned to the element. If not defined, the default style object will be assigned.
   */
  const assignStyles = (
    element: HTMLElement,
    ...styleObjects: Array<Partial<CSSStyleDeclaration>>
  ) => {
    if (!styleObjects) Object.assign(element?.style, style.default);

    for (let i = 0; i < styleObjects.length; i++) {
      Object.assign(element?.style, styleObjects[i]);
    }
  };

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
   * @param element Element which the screenshot will be taken from.
   * @param filename Filename of the screenshot image file.
   * @param options Screenshot options object.
   */
  const getScreenshot = (
    element: HTMLElement,
    filename: string,
    options?: Partial<ScreenshotOptions>,
  ) => {
    toPng(
      element,
      Object.assign(
        {
          backgroundColor: "white",
          quality: 1,
          pixelRatio: 3,
        },
        options,
      ),
    ).then((data) => {
      const link = document.createElement("a");
      link.download = generateFilename(filename, "png");
      link.href = data;
      link.click();
    });
  };

  const getExcel = (element: HTMLElement | Element, filename: string) => {
    XlsxWriteFile(
      XlsxUtils.table_to_book(element),
      generateFilename(filename, "xlsx"),
    );
  };

  /**
   * This function creates a button element with the custom `button` styles assigned.
   * @param textContent The text label of the created button element.
   * @returns The created button element.
   */
  const createButton = (textContent = ""): HTMLButtonElement => {
    const button = document.createElement("button");
    button.textContent = textContent;
    assignStyles(button, style.button);
    button.style.setProperty("font-size", "18px", "important");
    return button;
  };

  /**
   * This function blocks click events of the specified element.
   * @param element The element which click events will be blocked.
   */
  const blockClicks = (element: HTMLElement | Element) => {
    if (!element) throw new Error("Element not specified");

    element.addEventListener(
      "click",
      (e: Event) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      },
      true,
    );
  };

  /**
   * This function is used to generate filename with a NUSTools specific filename pattern.
   * @param name Name of the file being downloaded. (e.g: timetable).
   * @param type Specifing the file format. Only XLSX (Excel) and PNG (Image) for now.
   * @returns The full string of the generated filename.
   */
  const generateFilename = (name: string, type: "png" | "xlsx"): string =>
    `${name.replaceAll(" ", "-")}_bustan.nustools.${type}`;

  //#endregion

  //#region Element Selectors

  const selectors = Object.freeze({
    table: () => document.querySelector("table.k-selectable[role='grid']"),
    grid: () => document.querySelector("input[type='hidden']#gridmodelname"),
    gridToolbar: () => document.querySelector("div.k-grid-toolbar"),
    studentCard: () =>
      document.querySelector(
        "#divContainer > div:nth-child(4)[align='center']:has(table#studentcard)",
      ),
    cardImage: () => document.querySelector("#studentcard .person-image img"),
    surveyTable: () =>
      document.querySelector("#tblSER_CourseGroup_SurveyQuestion_Student"),
    timetable: () =>
      document.querySelector("input[type='hidden']#SelectedSER_CourseGroupIDs"),
    examCard: () =>
      document.querySelector(
        "#divContainer > div:nth-child(5)[align='center']:not([class])",
      ),
    boxHeader: () => document.querySelector("#divContainer > div.box-header"),
  });

  const getElement = <K extends keyof typeof selectors>(
    key: K,
  ): HTMLElement => {
    const element = selectors[key]();

    if (!element) throw new Error(`Selector "${key}" does not exist`);
    else return element as HTMLElement;
  };

  //#endregion

  //#region منو پروفایل بالای صفحه
  function addDropdownItems(): void {
    const dropdown = document.querySelector(
      "div.dropdown-menu > ul.list-unstyled",
    );
    if (dropdown) {
      if (dropdown.querySelector("div#added-by-nustools-ext")) return;
      const element = document.createElement("div");
      element.id = "added-by-nustools-ext";
      element.innerHTML = `
        <li>
            <a href="https://nustools.ir" class="dropdown-item" target="_blank">
                <i id="mfa" class="fa fa-bolt"></i>
                ابزار های بوستان
            </a>
        </li>
        <li>
            <a href="#https://nustools.ir/extension/help/update" class="dropdown-item" target="_blank">
                <i id="mfa" class="fa fa-puzzle-piece"></i>
                بروزرسانی افزونه
            </a>
        </li>
      `;

      dropdown?.lastElementChild?.remove();
      dropdown.append(element);
    }
  }
  //#endregion

  //#region منوی بغل
  function sideMenu(): void {
    const treeview = document.querySelector("div#divTreeView")! as HTMLElement;

    const label = treeview.querySelector("p")!;
    label.outerHTML = `
      <p style="margin:10px;text-align:center;color:#10438F;font-weight:700;font-size:18px;user-select:none">
        افزونه ابزار های بوستان (NUSTools) بارگذاری شد!
      </p>
    `;

    const sidebarMenu = treeview.querySelector(
      "ul.sidebar-menu",
    )! as HTMLElement;

    const menuItems = Array.from(sidebarMenu.children) as HTMLElement[];

    ["راهنما اطلاعيه و تغييرات", "آموزش‌هاي آزاد دانشجو"].forEach((i) =>
      menuItems.forEach((item) =>
        item.textContent.includes(i) ? item.remove() : null,
      ),
    );
  }
  //#endregion

  //#region صفحه چاپ انتخاب واحد
  function CoursesViewPage(): void {
    // couldn't use the nustools selectors
    const header = document.querySelector(
      "#frm > div.col-lg-12.col-md-12.col-sm-12.col-xs-12 > div > div > div > div.box-header",
    )! as HTMLElement;
    header.innerHTML = "";
    Object.assign(header.style, {
      display: "flex",
      gap: "1rem",
    });

    // couldn't use the nustools selectors
    const tbody = document.querySelector(
      "#frm > div.col-lg-12.col-md-12.col-sm-12.col-xs-12 > div > div > div > div.page > div > table > tbody",
    )!;

    const copyTimeTable = createButton("کپی جدول زمانی");
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

    const downloadExcel = createButton("دانلود فایل اکسل");
    downloadExcel.addEventListener("click", (e) => {
      e.preventDefault();
      getExcel(tbody, "timetable");
    });

    const sendToNusButton = createButton("ارسال به برنامه‌ساز NUSTools");
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
    const toolbar = getElement("gridToolbar");
    toolbar.innerHTML = "";
    toolbar.style.gap = "1rem";

    const downloadButton = createButton("دانلود فایل اکسل");
    downloadButton.addEventListener("click", (e) => {
      e.preventDefault();
      getExcel(getElement("table"), "course group");
    });

    const sendToNusButton = createButton("ارسال به پیش‌انتخاب واحد NUSTools");
    sendToNusButton.addEventListener("click", (e) =>
      alert("این قابلیت در دست توسعه است."),
    );

    toolbar.appendChild(downloadButton);
    toolbar.appendChild(sendToNusButton);
  }
  //#endregion

  //#region صفحه کارت دانشجویی
  function StudentCardPage(): void {
    const studentCard = getElement("studentCard");

    getElement("boxHeader").innerHTML = "";
    studentCard.style.margin = "0";
    studentCard.style.width = "fit-content";
    studentCard.style.padding = "2rem";

    const downloadImage = createButton("دانلود عکس کارت");
    downloadImage.addEventListener("click", () =>
      getScreenshot(studentCard, "student card", {
        pixelRatio: 2.5,
      }),
    );

    getElement("boxHeader").append(downloadImage);

    (
      studentCard.querySelector("table#studentcard") as HTMLElement
    ).style.width = "fit-content";

    const tr = studentCard.querySelector(
      "table#studentcard > tbody > tr",
    )! as HTMLElement;
    assignStyles(tr, {
      display: "flex",
      flexDirection: "column-reverse",
    });

    assignStyles(tr.firstElementChild as HTMLElement, {
      borderLeft: "0",
      borderTop: "3px solid #0e0101",
    });

    studentCard.querySelectorAll(".column").forEach((item, i) => {
      (item as HTMLElement).style.setProperty("font-size", "12px", "important");

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

    aspectRatioFix(getElement("cardImage"));

    (studentCard.querySelector("div.qr-code") as HTMLElement).style.top =
      "125px";
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
            `,
          )
          .join("")}
        `;

    assignStyles(surveySelectAllRow);

    const tbody = getElement("surveyTable").querySelector("tbody")!;
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
              `SurveyQuestionID_${i}_${score}`,
            );
            if (checkbox) checkbox.click();
          }
        }),
      );
  }
  //#endregion

  //#region صفحه کارت امتحانات
  function ExamCardPage(): void {
    const examCard = getElement("examCard");
    const boxHeader = getElement("boxHeader");

    assignStyles(examCard, {
      width: "fit-content",
      padding: "2rem",
    });

    const downloadImage = createButton("دانلود کارت امتحانات");
    downloadImage.addEventListener("click", () =>
      getScreenshot(examCard, "exam card"),
    );

    boxHeader.style.marginBottom = "2rem";
    boxHeader.innerHTML = "";
    boxHeader.append(downloadImage);

    const examCardChildren = examCard?.children!;

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

  //#region صفحه نمره موقت
  function scoresPage(): void {
    const averageRow = ({
      avg,
      passedUnits,
      totalUnits,
    }: {
      [key: string]: string | number;
    }) => `
      <td role="gridcell" id="avg-div" colspan="8">
        <p style="font-size:16px;margin:5px">
          میانگین نمرات: <span style="font-size:inherit">${avg}</span>
        </p>
        <p style="font-size:16px;margin:5px">
          واحدهای پاس‌شده: <span style="font-size:inherit">${passedUnits} از ${totalUnits}</span>
        </p>
      </td>
    `;

    const table = getElement("table");
    const tbody = table?.children[2];

    let courses: Record<string, { score: number; unit: number }> = {};

    Array.from(tbody.children).forEach((row) => {
      const scoreTextContent = (
        row as HTMLElement
      ).childNodes[0].textContent!.trim();

      const name = (row as HTMLElement).childNodes[2].textContent
        ?.toString()
        .trim()!;
      const score = parseFloat(scoreTextContent);
      const unit = parseFloat(
        (row as HTMLElement).childNodes[4].textContent!.trim(),
      );

      courses[name] = { score, unit };

      if (Number.isNaN(score))
        (row as HTMLElement)
          .querySelectorAll("td > p")
          .forEach(
            (item: Element) => ((item as HTMLElement).style.color = "#a60000"),
          );
    });

    let totalScoreTimesUnit = 0;
    let totalUnits = 0;
    let passedUnits = 0;

    for (const course of Object.values(courses)) {
      if (!Number.isNaN(course.score))
        totalScoreTimesUnit += course.score * course.unit;
      totalUnits += course.unit;

      if (course.score >= 10) passedUnits += course.unit;
    }

    const weightedAverage: Readonly<number> = totalScoreTimesUnit / passedUnits;
    const avg = weightedAverage.toFixed(2);

    const averageElement = document.createElement("tr");
    averageElement.innerHTML = averageRow({ avg, passedUnits, totalUnits });
    blockClicks(averageElement);

    tbody.append(averageElement);

    if (tbody.querySelectorAll("#avg-div").length > 1)
      tbody.querySelectorAll("#avg-div").forEach((item: Element) => {
        for (let i = tbody.querySelectorAll("#avg-div").length; i > 1; --i)
          item.remove();
      });

    assignStyles(tbody.querySelector("#avg-div")!, style.text);

    const toolbar = getElement("gridToolbar");
    toolbar.innerHTML = "";

    const downloadImage = createButton("دانلود عکس جدول");
    downloadImage.addEventListener("click", () => {
      getScreenshot(table, "temp scores");
    });

    toolbar.append(downloadImage);
  }
  //#endregion

  //#region صفحه حضور و غیاب
  function attendancePage(): void {
    const table = getElement("table");
    const tbody = table?.children[2] as HTMLElement;

    tbody.style.pointerEvents = "none";

    tbody.childNodes.forEach((row) => {
      if (parseInt(row.childNodes[4]?.textContent!) >= 3)
        (row as HTMLElement).style.color = "#a60000";

      blockClicks(row as HTMLElement);
    });

    const toolbar = getElement("gridToolbar");
    const text = document.createElement("span");
    text.textContent = "سطر های قرمز دارای 3 غیبت یا بیشتر هستند (NUSTools)";
    assignStyles(text, style.text, style.label);
    text.style.setProperty("font-size", style.text.fontSize!, "important");

    toolbar.innerHTML = "";
    toolbar.style.gap = "1rem";
    toolbar.append(text);
  }
  //#endregion

  //#region Observing the document for changes,
  // then deciding what do to based on the elements of the page.
  waitForDocument(() => {
    addDropdownItems();
    sideMenu();

    if (selectors.timetable()) CoursesViewPage();

    if (selectors.studentCard()) StudentCardPage();

    if (selectors.surveyTable()) SurveyPage();

    if (selectors.examCard()) ExamCardPage();

    switch ((selectors.grid() as HTMLInputElement)?.value) {
      case "SER_Course_For_Student":
        CoursesPage();
        break;

      case "SER_CourseGroup_Survey_Student":
        scoresPage();
        break;

      case "StudentAttendanceList":
        attendancePage();
        break;
    }
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
  },
);

//#endregion

//#region This is the event listener for fetches on the page. Check `page_inject.js` file.
window.addEventListener("message", (event) => {
  if (!event.data || !event.data.__nustools) return;
  else main();
});
//#endregion
