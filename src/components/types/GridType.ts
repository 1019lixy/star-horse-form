export interface GridContainer {
  display: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  // gridTemplateAreas?: CSSProperties["gridTemplateAreas"];
  // columnGap: CSSProperties["columnGap"];
  // rowGap: CSSProperties["rowGap"];
  gap?: string;
  gridAutoColumns?: string;
  gridAutoRows?: string;
  gridAutoFlow?: string;
  justifyContent?: string;
  justifyItems?: string;
  alignItems?: string;
  alignContent?: string;
}

export interface GridItemStyle {
  gridRowStart?: string;
  gridRowEnd?: string;
  gridRow?: string;
  gridColumn?: string;
  gridColumnStart?: string;
  gridColumnEnd?: string;
  // gridArea?: CSSProperties["gridArea"];
  justifySelf?: string;
  alignSelf?: string;
  width?: string;
  height?: string;
}

export interface GridItem {
  id: number;
  text: string;
  styles: GridItemStyle;
}

export interface GridState {
  items: GridItem[];
  container: GridContainer;
  selectedItems: number[];
  gridLines: boolean;
}

export interface Grid {
  items: GridItem[];
  container: GridContainer;
}
