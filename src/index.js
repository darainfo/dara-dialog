let DIALOG_IDX = 0;

const iconStyleMap = {
  primary: "primary",
  secondary: "secondary",
  info: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
};

/**
 * 다이얼로그 옵션
 * @typedef {Object} defaultOptions
 * @property {string, number} [width = 400] - 넓이
 * @property {string, number} [height= 300] - 높이
 * @property {string} styleClass - css class
 * @property {boolean} [isModal= false] - 모달 사용여부
 * @property {string} [icon= ""] - icon primary, secondary, info, success, warning, danger
 * @property {boolean} [autoOpen= true] - 자동 열기 여부
 * @property {boolean} [draggable= true] - drag 가능여부
 * @property {boolean} [resizable= false] - 창 리사이즈 여부
 * @property {boolean} [enableHeader= true] -  헤더 영역 보일지 여부
 * @property {boolean} [enableFooter= true] -  하단 버튼 영역 보일지 여부
 * @property {boolean} [enableMaxButton= true] -  최대화 버튼
 * @property {boolean} [enableCloseButton= true] -   닫기 버튼 활성화 여부
 * @property {number} [minHeight= 130] -  최소 높이
 * @property {number} [minWidth= 230] -   최소 넓이
 * @property {number} [zIndex= 10000] -  css z-index
 * @property {string} [dragOverflow= true] - darg 창 넘어서 drag 할지 여부
 * @property {Array} buttons= [] - dialog 하단 버튼
 * @property {number} moveDelay= 15 -  drag delay time
 * @property {function} afterOpen - 오픈후
 */

/** @type {defaultOptions} */
let defaultOptions = {
  width: 400,
  height: 300,
  styleClass: "",
  isModal: false,
  icon: "", // info,
  // 자동 열기 여부
  autoOpen: true,
  // drag 가능여부
  draggable: true,
  // 창 리사이즈 여부
  resizable: false,
  // 헤더 영역 보일지 여부
  enableHeader: true,
  // 하단 버튼 영역 보일지 여부
  enableFooter: true,
  // 최대화 버튼
  enableMaxButton: true,
  //  닫기 버튼 활성화 여부
  enableCloseButton: true,
  // 최소 높이
  minHeight: 130,
  //  최소 넓이
  minWidth: 230,
  // css z-index
  zIndex: 10000,
  dragOverflow: true,
  buttons: [],
  moveDelay: 15,
  afterOpen: false, // open 후 호출 메소드
};

function dialogHiddenElement() {
  if (document.getElementById("daraDialogHidden") == null) {
    document.querySelector("body")?.insertAdjacentHTML("beforeend", `<div id="daraDialogHidden" class="dara-dialog-hidden"></div>`);
  }

  return document.getElementById("daraDialogHidden");
}

/**
 * dialog 모듈
 *
 * @export
 * @class Dialog
 * @typedef {Dialog}
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
    const style = dialogWrapperElement.style;
    style.zIndex = this.options.zIndex + DIALOG_IDX;
    style.width = this.options.width == "auto" ? "auto" : this.options.width + "px";
    style.height = this.options.height == "auto" ? "auto" : this.options.height + "px";
    style.minHeight = this.options.minHeight + "px";
    style.minWidth = this.options.minWidth + "px";

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

  /**
   * default options 셋팅
   *
   * @static
   * @typedef {Object} defaultOptions
   */
  static setOptions(options) {
    defaultOptions = Object.assign({}, defaultOptions, options);
  }

  /** 사이즈 조절 초기화 */
  initResize() {
    const dialogElement = this.dialogWrapperElement;
    const reslzeElement = this.dialogWrapperElement.querySelectorAll(".resizer");

    let dialogWidth, dialogHeight;
    let startX, startY;
    let moveMode = "";
    let offsetX = -1,
      offsetY = -1;

    let isResizeTop, isResizeLeft;

    this.addEvent(reslzeElement, "mousedown touchdown", (e) => {
      if (this.isMaximise()) {
        return false;
      }

      moveMode = e.target.getAttribute("data-mode");

      isResizeTop = moveMode.indexOf("t") > -1;
      isResizeLeft = moveMode.indexOf("l") > -1;

      offsetX = isResizeLeft ? dialogElement.getBoundingClientRect().left : -1;
      offsetY = isResizeTop ? dialogElement.getBoundingClientRect().top : -1;

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

        moveY = isResizeTop ? moveY * -1 : moveY;
        moveX = isResizeLeft ? moveX * -1 : moveX;

        let resizeHeight = dialogHeight + moveY,
          resizeWidth = dialogWidth + moveX;

        if (this.options.minHeight >= resizeHeight) {
          resizeHeight = this.options.minHeight;
          moveY = (dialogHeight - resizeHeight) * -1;
        }

        if (this.options.minWidth >= resizeWidth) {
          resizeWidth = this.options.minWidth;
          moveX = (dialogWidth - resizeWidth) * -1;
        }

        let topVal = -1;
        if (isResizeTop) {
          topVal = offsetY - moveY;
          if (topVal <= 0) {
            topVal = 0;
            resizeHeight = dialogHeight + offsetY;
          }
          dialogElement.style.top = topVal + "px";
        }

        let leftVal = -1;
        if (isResizeLeft) {
          leftVal = offsetX - moveX;
          if (leftVal <= 0) {
            leftVal = 0;
            resizeWidth = dialogWidth + offsetX;
          }
          dialogElement.style.left = leftVal + "px";
        }

        if (moveMode != "b" && moveMode != "t") {
          dialogElement.style.width = resizeWidth + "px";
        }

        if (moveMode != "r" && moveMode != "l") {
          dialogElement.style.height = resizeHeight + "px";
        }
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
    const dragElement = this.dialogWrapperElement.querySelector(".dialog-header");

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
    let minX, minY;
    if (this.options.dragOverflow === false) {
      minX = Math.min(Math.max(e.clientX - offsetX, 0), window.innerWidth - dialogWidth);
      minY = Math.min(Math.max(e.clientY - offsetY, 0), window.innerHeight - dialogHeight);
    } else {
      minX = Math.min(Math.max(e.clientX - offsetX, (dialogWidth - 80) * -1), window.innerWidth - 80);

      minY = Math.min(Math.max(e.clientY - offsetY, 0), window.innerHeight - 30);
    }

    this.dialogWrapperElement.style.left = minX + "px";
    this.dialogWrapperElement.style.top = minY + "px";
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
          ${this.options.enableMaxButton ? `<span class="dialog-maximise"></span>` : ""}
          ${this.options.enableCloseButton ? `<span class="dialog-close"></span>` : ""}
          </div>
        </div>`
      );
    }

    dialogHtml.push(
      `<div class="dialog-body ${iconStyleMap[this.options.icon] ?? ""}" style="height: calc(100% ${enableHeader ? " - 40px" : ""}${this.options.enableFooter ? " - 45px" : ""})"><div class="dialog-move-overay"></div><div class="dialog-content">`
    );

    if (this.options.url) {
      dialogHtml.push(`<iframe src="${this.options.url}" class="dialog-frame"></iframe>`);
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
        dialogHtml.push(`<span class="dialog-btn dialog-btn-${i} ${styleClass}">${button.label}</span>`);
      }

      dialogHtml.push("</div></div>");
    }

    if (this.options.resizable === true) {
      dialogHtml.push(`
        <div class="resizer top" data-mode="t"></div>
        <div class="resizer left" data-mode="l"></div>
        <div class="resizer right" data-mode="r"></div>
        <div class="resizer bottom" data-mode="b"></div>  

        <div class="resizer top-left" data-mode="tl"></div>
        <div class="resizer top-right" data-mode="tr"></div>
        <div class="resizer bottom-left" data-mode="bl"></div>
        <div class="resizer bottom-right" data-mode="br"></div>
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
        const btnElement = this.dialogWrapperElement.querySelector(`.dialog-footer .dialog-btn-${i}`);
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
      dialogOverrayElement.style.zIndex = this.options.zIndex + this.idx;

      const hiddenElement = dialogHiddenElement();
      const firstChild = hiddenElement.firstChild;

      if (firstChild) {
        hiddenElement.insertBefore(dialogOverrayElement, firstChild);
      } else {
        hiddenElement.appendChild(dialogOverrayElement);
      }

      this.dialogOverrayElement = dialogOverrayElement;
    }

    if (typeof this.options.afterOpen === "function") {
      this.options.afterOpen.call(this, this.dialogWrapperElement);
    }

    return this;
  };

  /**
   * dialog hide
   */
  hide = () => {
    this.dialogWrapperElement.classList.add("hide");

    if (this.options.isModal === true) {
      dialogHiddenElement().removeChild(this.dialogOverrayElement);
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
    dialogHiddenElement().removeChild(this.dialogWrapperElement);
    this.dialogWrapperElement = null;
    this.options = null;
    this.idx = -1;
  };
}
