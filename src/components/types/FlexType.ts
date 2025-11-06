export interface FlexboxContainer {
  display: string;
  gap: string;
  description?: string;
  flexWrap?: string;
  justifyContent?: string;
  alignItems?: string;
  alignContent?: string;
  flexDirection?: string;
}

export interface FlexboxItemStyle {
  order?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string;
  alignSelf?: string;
  width?: string;
  height?: string;
}

export interface FlexboxItem {
  id: number;
  text: string;
  styles: FlexboxItemStyle;
}

export interface FlexboxState {
  items: FlexboxItem[];
  container: FlexboxContainer;
  selectedItems: number[];
}

export interface Flexbox {
  items: FlexboxItem[];
  container: FlexboxContainer;
}
