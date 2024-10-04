let DIALOG_IDX = 0;

const styleClassMap = {
  primary: "primary",
  secondary: "secondary",
  info: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
};

let defaultOptions = {
  width: "400px",
  height: "300px",
  style: "",
  isModal: false,
  // 자동 열기 여부
  autoOpen: true,
  draggable: true, // drag 가능여부
  resizable: false, // 창 리사이즈 여부
  enableHeader: true, // 헤더 영역 보일지 여부
  enableFooter: true, // 하단 버튼 영역 보일지 여부
  enableMaxButton: true, // 최대화 버튼
  enableCloseButton: true, //  닫기 버튼 활성화 여부
  zIndex: 10000, // css z-index
  buttons: [],
  moveDelay: 15,
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
    this.idx = DIALOG_IDX += 1;

    const dialogWrapperElement = document.createElement("div");
    dialogWrapperElement.className = `dara-dialog-wrapper hide dd-${DIALOG_IDX}`;
    dialogWrapperElement.style = `z-index:${
      this.options.zIndex + DIALOG_IDX
    };width:${this.options.width};height:${this.options.height};`;

    dialogHiddenElement().appendChild(dialogWrapperElement);
    this.dialogWrapperElement = dialogWrapperElement;

    this.dialogTemplate();

    if (this.options.draggable !== false) {
      this.initDrag();
    }

    if (this.options.resizable === true) {
      dialogWrapperElement.classList.add("resizable");
      this.initResize();
    }

    if (this.options.autoOpen !== false) {
      this.show();
    }
  }

  static setOptions(options) {
    defaultOptions = Object.assign({}, defaultOptions, options);
  }

  initResize() {
    const dialogElement = this.dialogWrapperElement;
    const reslzeElement =
      this.dialogWrapperElement.querySelectorAll(".resizer");

    let dialogWidth, dialogHeight;
    let startX, startY;

    this.addEvent(reslzeElement, "mousedown touchdown", (e) => {
      if (this.isMaximise()) {
        return false;
      }

      e.preventDefault();

      const oe = e.touches;

      startX = oe && oe[0] ? oe[0].pageX : e.pageX;
      startY = oe && oe[0] ? oe[0].pageY : e.pageY;

      dialogWidth = dialogElement.clientWidth;
      dialogHeight = dialogElement.clientHeight;

      if (!dialogElement.classList.contains("transform-disable")) {
        const offsetX = e.clientX - dialogElement.getBoundingClientRect().left;
        const offsetY = e.clientY - dialogElement.getBoundingClientRect().top;

        this.setPosition(e, offsetX, offsetY, dialogWidth, dialogHeight);

        dialogElement.classList.add("transform-disable");
      }

      this.addEvent(document, "mousemove touchmove", onResizeMouseMove);

      this.addEvent(document, "mouseup touchup", onResizeMouseUp);
    });
    let startTime = -1;
    let moveTimer;
    const moveDelay = this.options.moveDelay;
    const onResizeMouseMove = (e) => {
      if (startTime == -1) {
        startTime = new Date().getTime();
      }

      if (new Date().getTime() - moveDelay <= startTime) {
        clearTimeout(moveTimer);
      }

      const oe1 = e.touches;

      moveTimer = setTimeout(() => {
        startTime = -1;
        let moveX = (oe1 && oe1[0] ? oe1[0].pageX : e.pageX) - startX,
          moveY = (oe1 && oe1[0] ? oe1[0].pageY : e.pageY) - startY;

        dialogElement.style.width = dialogWidth + moveX + "px";

        dialogElement.style.height = dialogHeight + moveY + "px";
      }, moveDelay);
    };

    const onResizeMouseUp = () => {
      clearTimeout(moveTimer);
      this.removeEvent(document, "mousemove touchmove", onResizeMouseMove);
      this.removeEvent(document, "mouseup touchup", onResizeMouseUp);
    };
  }

  /**
   * init drag
   */
  initDrag() {
    const dialogElement = this.dialogWrapperElement;
    const dragElement =
      this.dialogWrapperElement.querySelector(".dialog-header");

    let isDragging = false;

    let offsetX, offsetY, dialogWidth, dialogHeight;

    let isDrag = false;

    this.addEvent(dragElement, "mousedown touchdown", (e) => {
      const tagName = e.target.tagName;

      if (tagName.search(/(input|textarea|select|button)/gi) > -1) {
        return true;
      }

      if (this.isMaximise()) {
        return false;
      }

      e.preventDefault();

      dialogWidth = dialogElement.clientWidth;
      dialogHeight = dialogElement.clientHeight;

      isDragging = true;
      offsetX = e.clientX - dialogElement.getBoundingClientRect().left;
      offsetY = e.clientY - dialogElement.getBoundingClientRect().top;

      if (!isDrag) {
        this.setPosition(e, offsetX, offsetY, dialogWidth, dialogHeight);

        isDrag = true;
        dialogElement.classList.add("transform-disable");
      }

      dialogElement.classList.add("move-on");

      this.addEvent(document, "mousemove touchmove", onMouseMove);

      this.addEvent(document, "mouseup touchup", onMouseUp);
    });
    let startTime = -1;
    let moveTimer;
    const moveDelay = this.options.moveDelay;
    const onMouseMove = (e) => {
      if (isDragging) {
        if (startTime == -1) {
          startTime = new Date().getTime();
        }

        if (new Date().getTime() - moveDelay <= startTime) {
          clearTimeout(moveTimer);
        }

        moveTimer = setTimeout(() => {
          startTime = -1;
          this.setPosition(e, offsetX, offsetY, dialogWidth, dialogHeight);
        }, moveDelay);
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      clearTimeout(moveTimer);

      dialogElement.classList.remove("move-on");
      this.removeEvent(document, "mousemove touchmove", onMouseMove);
      this.removeEvent(document, "mouseup touchup", onMouseUp);
    };
  }

  /**
   * dialog position
   *
   * @param {Event} e event
   * @param {Number} offsetX offset x
   * @param {Number} offsetY offset y
   * @param {Number} dialogWidth dialog width
   * @param {Number} dialogHeight dialog height
   */
  setPosition(e, offsetX, offsetY, dialogWidth, dialogHeight) {
    const minX = Math.min(
      Math.max(e.clientX - offsetX, 0),
      window.innerWidth - dialogWidth
    );
    const minY = Math.min(
      Math.max(e.clientY - offsetY, 0),
      window.innerHeight - dialogHeight
    );

    this.dialogWrapperElement.style.left = (minX > 0 ? minX : 0) + "px";
    this.dialogWrapperElement.style.top = (minY > 0 ? minY : 0) + "px";
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
              ? `<span class="dialog-maximise"><svg width="16px" height="16px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path fill="#6c6c6c" d="M4.5 3C3.67157 3 3 3.67157 3 4.5V11.5C3 12.3284 3.67157 13 4.5 13H11.5C12.3284 13 13 12.3284 13 11.5V4.5C13 3.67157 12.3284 3 11.5 3H4.5ZM4.5 4H11.5C11.7761 4 12 4.22386 12 4.5V11.5C12 11.7761 11.7761 12 11.5 12H4.5C4.22386 12 4 11.7761 4 11.5V4.5C4 4.22386 4.22386 4 4.5 4Z" />
              </svg>
              </span>`
              : ""
          }
          ${
            this.options.enableCloseButton
              ? `<span class="dialog-close"><svg width="16px" height="16px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path fill="#6c6c6c" d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"/>
              </svg></span>`
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
        this.options.enableFooter ? " - 45px" : ""
      })"><div class="dialog-move-overay"></div><div class="dialog-content">`
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

      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const styleClass = button.styleClass ?? "success";
        dialogHtml.push(
          `<span class="dialog-btn dialog-btn-${i} ${styleClass}">${button.label}</span>`
        );
      }

      dialogHtml.push("</div></div>");
    }

    if (this.options.resizable === true) {
      dialogHtml.push(`
        <div class="resizer top"></div>
        <div class="resizer left"></div>
        <div class="resizer right"></div>
        <div class="resizer bottom"></div>  

        <div class="resizer top-left"></div>
        <div class="resizer top-right"></div>
        <div class="resizer bottom-left"></div>
        <div class="resizer bottom-right"></div>
      `);
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

    if (this.options.enableFooter !== false) {
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const btnElement = this.dialogWrapperElement.querySelector(
          `.dialog-footer .dialog-btn-${i}`
        );
        btnElement.addEventListener("mousedown", (e) => {
          if (button.callback) {
            button.callback(e);
          }
        });
      }
    }
  }

  /**
   * show dialog message
   * @param {*} viewItems
   * @returns
   */
  show = () => {
    this.dialogWrapperElement.classList.remove("hide");
    if (this.options.isModal === true) {
      const dialogOverrayElement = document.createElement("div");
      dialogOverrayElement.className = "dara-dialog-overlay";
      dialogOverrayElement.style = `z-index:${this.options.zIndex + this.idx}`;
      dialogHiddenElement().prepend(dialogOverrayElement);
      this.dialogOverrayElement = dialogOverrayElement;
    }

    return this;
  };

  /**
   * dialog hide
   */
  hide = () => {
    this.dialogWrapperElement.classList.add("hide");

    if (this.options.isModal === true) {
      this.dialogOverrayElement.remove();
    }
  };

  /**
   * maximise hide
   *
   */
  maximise = () => {
    const classList = this.dialogWrapperElement.classList;
    if (classList.contains("maximise")) {
      classList.remove("maximise");
    } else {
      classList.add("maximise");
    }
  };

  isMaximise() {
    return this.dialogWrapperElement.classList.contains("maximise");
  }

  addEvent(elements, events, fnHandler) {
    events.split(" ").forEach(function (e) {
      if (elements instanceof NodeList) {
        for (let element of elements) {
          element.addEventListener(e, fnHandler, false);
        }
      } else {
        elements.addEventListener(e, fnHandler, false);
      }
    });
  }

  removeEvent(elements, events, fnHandler) {
    events.split(" ").forEach(function (e) {
      if (elements instanceof NodeList) {
        for (let element of elements) {
          element.removeEventListener(e, fnHandler);
        }
      } else {
        elements.removeEventListener(e, fnHandler);
      }
    });
  }

  /**
   * dialog destroy
   */
  destroy = () => {
    this.dialogWrapperElement.remove();
  };
}
