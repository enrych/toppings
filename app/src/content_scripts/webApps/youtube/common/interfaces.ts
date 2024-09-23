export interface ToppingsPanelHeader {
  panelId: string;
  panelClass?: string;
  btnLabel: string;
  btnOnClick: (event: Event) => void;
  panelTitle: string;
  panelOptions?: {
    optionsTitle: string;
    optionsOnClick: (event: Event) => void;
  };
  options?: (target: HTMLDivElement) => void;
}

export interface ToppingsMenuItem {
  itemId: string;
  itemClass?: string;
  hasAriaPopUp?: string;
  hasAriaChecked?: string;
  itemRole?: string;
  itemTabIndex?: string;
  itemIconPath?: string;
  itemLabel?: string;
  itemContent?: Node;
  itemOnClick: (event: Event) => void;
  options?: (target: HTMLDivElement) => void;
}
