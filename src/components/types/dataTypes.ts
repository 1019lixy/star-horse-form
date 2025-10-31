// @ts-ignore
import {
  FlexboxContainer,
  FlexboxItem,
  FlexboxItemStyle,
} from "@/components/types/FlexType";
// @ts-ignore
import {
  GridContainer,
  GridItem,
  GridItemStyle,
} from "@/components/types/GridType";

type ConfigBase = TypeConfig &
  ItemType & {
    title: string;
    description: string;
    icon: string;
    defaultValue: string;
    // itemType?: "default" | "dropdown";
    // itemType?: ItemType;
  };

type ItemType = DropDownConfig | { itemType?: "default"; defaultValue: string };

type DropDownConfig = DropDownType & {
  itemType?: "dropdown";
  dropDownSeparator?: string;
};

type DropDownType =
  | { dropDownType: "iteration"; placeholder: string }
  | { dropDownType: "combine"; combineData: CombineType[] };

export type CombineType = TypeConfig & {
  key: string;
  title: string;
  description: string;
};

type TypeConfig = SelectConfig | InputConfig;

type SelectConfig = {
  type: "select";
  options: string[];
};

type InputConfig = InputType & {
  type: "input";
};

type InputType =
  | { inputType: "unit"; unitOptions: string[] }
  | { inputType: "number"; step?: number };

export type ContainerConfig = ConfigBase & {
  key: keyof FlexboxContainer | keyof GridContainer;
};

export type ItemConfig = ConfigBase & {
  key: keyof FlexboxItemStyle | keyof GridItemStyle;
};
export interface Layout {
  name: string;
  icon: string;
  layout: {
    items: FlexboxItem[] | GridItem[];
    container: FlexboxContainer | GridContainer;
  };
}
