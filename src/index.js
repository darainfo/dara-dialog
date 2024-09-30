let DIALOG_IDX = 0;

const styleClassMap = {
  primary: "primary",
  secondary: "secondary",
  info: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
};

const defaultdialogItem = {
  title: "", // 제목
  text: "", // 내용
  enableCloseButton: true, // 닫기 버튼 활성화여부
  enableMove: true, // dialog drag move 활성화
  //style: "success", //  백그라운드 색깔.  | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'danger'
  textColor: "#000000", // 글자 색
  enableProgress: true, //  프로그래스 바 사용여부.
};

let defaultOptions = {
  width: "400px",
  height: "300px",
  style: "",
  // 자동 열기 여부
  autoOpen: true,
  enableHeader: true, // 헤더 영역 보일지 여부
  enableFooter: true, // 하단 버튼 영역 보일지 여부
  enableMaxButton: true, // 최대화 버튼
  enableCloseButton: true, //  닫기 버튼 활성화 여부
  zIndex: 10000, // css z-index
  buttons: [],
};

function dialogHiddenElement() {
  if (document.getElementById("daraDialogHidden") == null) {
    document
      .querySelector("body")
      ?.insertAdjacentHTML(
        "beforeend",
        `<div id="daraDialogHidden" class="dara-dialog-hidden"></div>`
      );
  }

  return document.getElementById("daraDialogHidden");
}

/**
 * dialog message 모듈
 */
export class Dialog {
  static VERSION = APP_VERSION;
  constructor(options) {
    if (typeof options === "string") {
      options = { items: options };
    }

    this.options = Object.assign({}, defaultOptions, options);
    DIALOG_IDX += 1;

    const dialogWrapperElement = document.createElement("div");
    dialogWrapperElement.className = `dara-dialog-wrapper dd-${DIALOG_IDX}`;
    dialogWrapperElement.style = `width:${this.options.width};z-index:${this.options.zIndex};`;
    dialogHiddenElement().appendChild(dialogWrapperElement);
    this.dialogWrapperElement = dialogWrapperElement;

    this.dialogTemplate();

    if (this.options.enableMove !== false) {
      this.initDrag();
    }

    if (this.options.autoOpen !== false) {
      this.show();
    }
  }

  static setOptions(options) {
    defaultOptions = Object.assign({}, defaultOptions, options);
  }

  initDrag() {
    const dialogElement = this.dialogWrapperElement;
    const dragElement =
      this.dialogWrapperElement.querySelector(".dialog-header");

    let isDragging = false;

    let offsetX, offsetY;

    const dialogWidth = dialogElement.clientWidth;
    const dialogHeight = dialogElement.clientHeight;

    dragElement.addEventListener("mousedown", (e) => {
      var tagName = e.target.tagName;
      if (tagName.search(/(input|textarea|select|button)/gi) > -1) {
        return true;
      }

      if (this.isMaximise()) {
        return false;
      }

      isDragging = true;
      offsetX = e.clientX - dialogElement.getBoundingClientRect().left;
      offsetY = e.clientY - dialogElement.getBoundingClientRect().top;
      dragElement.style.cursor = "move";

      document.addEventListener("mousemove", onMouseMove);

      document.addEventListener("mouseup", onMouseUp);
    });

    const onMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        const maxX = window.innerWidth - dialogWidth;
        const maxY = window.innerHeight - dialogHeight;

        dialogElement.style.left = Math.min(Math.max(newX, 0), maxX) + "px";
        dialogElement.style.top = Math.min(Math.max(newY, 0), maxY) + "px";
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      dragElement.style.cursor = "grab";

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }

  dialogTemplate() {
    const enableHeader = this.options.enableHeader !== false;
    const dialog = document.createElement("div");
    const styleClass = this.options.styleClass ?? "";

    dialog.className = `dara-dialog ${styleClass}`;

    let dialogHtml = [];

    if (enableHeader) {
      dialogHtml.push(
        `<div class="dialog-header" >
          ${this.options.title ?? ""}
          <div class="btn-area">
          ${
            this.options.enableMaxButton
              ? '<span class="dialog-maximise">ㅁ</span>'
              : ""
          }
          ${
            this.options.enableCloseButton
              ? '<span class="dialog-close">×</span>'
              : ""
          }
          </div>
        </div>`
      );
    }

    dialogHtml.push(
      `<div class="dialog-body" style="height: calc(100% ${
        enableHeader ? " - 40px" : ""
      }${
        this.options.enableFooter ? " - 35px" : ""
      })"><div class="dialog-content">`
    );

    if (this.options.url) {
      dialogHtml.push(
        `<iframe src="${this.options.url}" class="dialog-frame"></iframe>`
      );
    } else {
      if (typeof this.options.template === "string") {
        dialogHtml.push(this.options.template);
      } else {
        dialogHtml.push(this.options.template());
      }
    }

    dialogHtml.push("</div></div>");

    // footer
    const buttons = this.options.buttons ?? [];

    if (this.options.enableFooter !== false) {
      dialogHtml.push('<div class="dialog-footer"><div class="btn-area">');

      for (var i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const styleClass = button.styleClass ?? "success";
        dialogHtml.push(
          `<span class="dialog-btn ${styleClass}">${button.label}</span>`
        );
      }

      dialogHtml.push("</div></div>");
    }

    dialog.innerHTML = dialogHtml.join("");

    this.dialogWrapperElement.appendChild(dialog); // Append the dialog element

    if (this.options.enableMaxButton) {
      dialog.querySelector(".dialog-maximise").addEventListener("click", () => {
        this.maximise(dialog);
      });
    }

    if (this.options.enableCloseButton) {
      dialog.querySelector(".dialog-close").addEventListener("click", () => {
        this.hide(dialog);
      });
    }
  }

  /**
   * show dialog message
   * @param {*} viewItems
   * @returns
   */
  show = () => {
    return this;
  };

  /**
   * dialog hide
   */
  hide() {
    this.dialogWrapperElement.classList.add("hide");
  }

  /**
   * maximise hide
   * @param {*} dialog
   */
  maximise() {
    const classList = this.dialogWrapperElement.classList;
    if (classList.contains("maximise")) {
      classList.remove("maximise");
    } else {
      classList.add("maximise");
    }
  }

  isMaximise() {
    return this.dialogWrapperElement.classList.contains("maximise");
  }

  /**
   * dialog destroy
   */
  destroy = () => {
    this.dialogWrapperElement.remove();
  };
}
