/**
 * dialog message 모듈
 */
export class Dialog {
  constructor(options: any);
  options: any;
  viewItemCount: number;
  dialogWrapperElement: HTMLDivElement;
  /**
   * add dialog item
   * @param {*} item
   */
  addItem(item: any): void;
  /**
   * show dialog message
   * @param {*} viewItems
   * @returns
   */
  show: (viewItems: any) => this;
  /**
   * dialog hide
   * @param {*} dialog
   */
  hide(dialog: any): void;
  /**
   * dialog destroy
   */
  destroy: () => void;
}
