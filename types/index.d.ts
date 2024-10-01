/**
 * dialog message 모듈
 */
export class Dialog {
  constructor(options: any);
  options: any;
  idx: number;
  dialogWrapperElement: HTMLDivElement;

  /**
   * maximise hide
   *
   */
  maximise(): void;
  /**
   * show dialog message
   *
   */
  show: () => void;
  /**
   * dialog hide
   */
  hide(): void;
  /**
   * dialog destroy
   */
  destroy: () => void;
}
