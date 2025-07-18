export interface PageCompContainer {}

export interface PageCompItemPreps {}

export interface PageCompItem {
  id: string;
  label: string;
  name: string;
  icon?: string;
  preps: PageCompItemPreps;
}

export interface PageComp {
  id: string;
  label: string;
  name: string;
  icon?: string;
  items?: PageCompItem[];
  container?: PageCompContainer;
}
