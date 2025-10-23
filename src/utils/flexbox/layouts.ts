import { FlexboxContainer, FlexboxItem } from "@/components/types/FlexType";
import { i18n } from "@/lang";

export interface Layout {
  name: string;
  icon: string;
  layout: {
    items: FlexboxItem[];
    container: FlexboxContainer;
  };
}

export const flexboxLayouts: Layout[] = [
  {
    name: i18n("system.flexbox.layouts.fillSpace"),
    icon: "fillSpace",
    layout: {
      items: [
        { id: 1, text: "1", styles: { flexGrow: 1 } },
        { id: 2, text: "2", styles: { flexGrow: 1 } },
        { id: 3, text: "3", styles: { flexGrow: 1 } },
      ],
      container: { display: "flex", gap: "20px" },
    },
  },
  {
    name: i18n("system.flexbox.layouts.stretchMiddle"),
    icon: "stretchMiddle",
    layout: {
      items: [
        { id: 1, text: "1", styles: { width: "150px" } },
        { id: 2, text: "2", styles: { flexGrow: 1 } },
        { id: 3, text: "3", styles: { width: "150px" } },
      ],
      container: { display: "flex", gap: "20px" },
    },
  },
  {
    name: i18n("system.flexbox.layouts.html5"),
    icon: "html5",
    layout: {
      items: [
        { id: 1, text: "Header", styles: { width: "100%", height: "5%" } },
        { id: 2, text: "Sidebar", styles: { width: "25%", height: "75%" } },
        { id: 3, text: "Content", styles: { flexGrow: 1, height: "75%" } },
        { id: 4, text: "Footer", styles: { width: "100%", height: "5%" } },
      ],
      container: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        alignContent: "start",
      },
    },
  },
  {
    name: i18n("system.flexbox.layouts.alternatingGrid"),
    icon: "alternatingGrid",
    layout: {
      items: [
        { id: 1, text: "1", styles: { flexGrow: 1 } },
        { id: 2, text: "2", styles: { flexGrow: 1 } },
        { id: 3, text: "3", styles: { width: "100%" } },
        { id: 4, text: "4", styles: { flexGrow: 1 } },
        { id: 5, text: "5", styles: { flexGrow: 1 } },
      ],
      container: { display: "flex", gap: "8px", flexWrap: "wrap" },
    },
  },
  {
    name: i18n("system.flexbox.layouts.masonryColumn"),
    icon: "masonryColumn",
    layout: {
      items: [
        { id: 1, text: "1", styles: { width: "32%", height: "40%" } },
        { id: 2, text: "2", styles: { width: "32%", height: "30%" } },
        { id: 3, text: "3", styles: { width: "32%", flexGrow: 1 } },
        { id: 4, text: "4", styles: { width: "32%", height: "25%" } },
        { id: 5, text: "5", styles: { width: "32%", height: "40%" } },
        { id: 6, text: "6", styles: { width: "32%", flexGrow: 1 } },
        { id: 7, text: "7", styles: { width: "32%", height: "40%" } },
        { id: 8, text: "8", styles: { width: "32%", height: "30%" } },
        { id: 9, text: "9", styles: { width: "32%", flexGrow: 1 } },
      ],
      container: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        flexWrap: "wrap",
      },
    },
  },
  {
    name: i18n("system.flexbox.layouts.masonryRow"),
    icon: "masonryRow",
    layout: {
      items: [
        { id: 1, text: "1", styles: { height: "32%", width: "40%" } },
        { id: 2, text: "2", styles: { height: "32%", width: "30%" } },
        { id: 3, text: "3", styles: { height: "32%", flexGrow: 1 } },
        { id: 4, text: "4", styles: { height: "32%", width: "25%" } },
        { id: 5, text: "5", styles: { height: "32%", width: "40%" } },
        { id: 6, text: "6", styles: { height: "32%", flexGrow: 1 } },
        { id: 7, text: "7", styles: { height: "32%", width: "40%" } },
        { id: 8, text: "8", styles: { height: "32%", width: "30%" } },
        { id: 9, text: "9", styles: { height: "32%", flexGrow: 1 } },
      ],
      container: {
        display: "flex",
        flexDirection: "row",
        gap: "8px",
        flexWrap: "wrap",
      },
    },
  },
  {
    name: i18n("system.flexbox.layouts.grid3x3"),
    icon: "grid3x3",
    layout: {
      items: [
        { id: 1, text: "1", styles: { width: "32%", height: "32%" } },
        { id: 2, text: "2", styles: { width: "32%", height: "32%" } },
        { id: 3, text: "3", styles: { width: "32%", height: "32%" } },
        { id: 4, text: "4", styles: { width: "32%", height: "32%" } },
        { id: 5, text: "5", styles: { width: "32%", height: "32%" } },
        { id: 6, text: "6", styles: { width: "32%", height: "32%" } },
        { id: 7, text: "7", styles: { width: "32%", height: "32%" } },
        { id: 8, text: "8", styles: { width: "32%", height: "32%" } },
        { id: 9, text: "9", styles: { width: "32%", height: "32%" } },
      ],
      container: { display: "flex", gap: "8px", flexWrap: "wrap" },
    },
  },
  {
    name: i18n("system.flexbox.layouts.grid4x4"),
    icon: "grid4x4",
    layout: {
      items: [
        { id: 1, text: "1", styles: { width: "23.5%", height: "23.5%" } },
        { id: 2, text: "2", styles: { width: "23.5%", height: "23.5%" } },
        { id: 3, text: "3", styles: { width: "23.5%", height: "23.5%" } },
        { id: 4, text: "4", styles: { width: "23.5%", height: "23.5%" } },
        { id: 5, text: "5", styles: { width: "23.5%", height: "23.5%" } },
        { id: 6, text: "6", styles: { width: "23.5%", height: "23.5%" } },
        { id: 7, text: "7", styles: { width: "23.5%", height: "23.5%" } },
        { id: 8, text: "8", styles: { width: "23.5%", height: "23.5%" } },
        { id: 9, text: "9", styles: { width: "23.5%", height: "23.5%" } },
        { id: 10, text: "10", styles: { width: "23.5%", height: "23.5%" } },
        { id: 11, text: "11", styles: { width: "23.5%", height: "23.5%" } },
        { id: 12, text: "12", styles: { width: "23.5%", height: "23.5%" } },
        { id: 13, text: "13", styles: { width: "23.5%", height: "23.5%" } },
        { id: 14, text: "14", styles: { width: "23.5%", height: "23.5%" } },
        { id: 15, text: "15", styles: { width: "23.5%", height: "23.5%" } },
        { id: 16, text: "16", styles: { width: "23.5%", height: "23.5%" } },
      ],
      container: { display: "flex", gap: "8px", flexWrap: "wrap" },
    },
  },
  {
    name: i18n("system.flexbox.layouts.alignCenter"),
    icon: "alignCenter",
    layout: {
      items: [
        { id: 1, text: "1", styles: { width: "25%", height: "150px" } },
        { id: 2, text: "2", styles: { width: "25%", height: "150px" } },
        { id: 3, text: "3", styles: { width: "25%", height: "150px" } },
        { id: 4, text: "4", styles: { width: "25%", height: "150px" } },
        { id: 5, text: "5", styles: { width: "25%", height: "150px" } },
        { id: 6, text: "6", styles: { width: "25%", height: "150px" } },
      ],
      container: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
      },
    },
  },
  {
    name: i18n("system.flexbox.layouts.fillRemainingSpace"),
    icon: "fillRemainingSpace",
    layout: {
      items: [
        { id: 1, text: "1", styles: { height: "150px" } },
        { id: 2, text: "2", styles: { height: "150px" } },
        { id: 3, text: "3", styles: { height: "150px", flexGrow: 1 } },
      ],
      container: { display: "flex", gap: "8px", flexWrap: "wrap" },
    },
  },
  {
    name: i18n("system.flexbox.layouts.fillRemainingSpace2"),
    icon: "fillRemainingSpace2",
    layout: {
      items: [
        { id: 1, text: "1", styles: { height: "150px" } },
        { id: 2, text: "2", styles: { height: "150px", flexGrow: 1 } },
        { id: 3, text: "3", styles: { height: "150px" } },
      ],
      container: { display: "flex", gap: "8px", flexWrap: "wrap" },
    },
  },
  {
    name: i18n("system.flexbox.layouts.horizontalBars"),
    icon: "horizontalBars",
    layout: {
      items: [
        { id: 1, text: "1", styles: { width: "40%" } },
        { id: 2, text: "2", styles: { width: "80%" } },
        { id: 3, text: "3", styles: { width: "100%" } },
        { id: 4, text: "4", styles: { width: "25%" } },
        { id: 5, text: "5", styles: { width: "35%" } },
      ],
      container: { display: "flex", gap: "8px", flexDirection: "column" },
    },
  },
  {
    name: i18n("system.flexbox.layouts.verticalBars"),
    icon: "verticalBars",
    layout: {
      items: [
        { id: 1, text: "1", styles: { height: "40%" } },
        { id: 2, text: "2", styles: { height: "80%" } },
        { id: 3, text: "3", styles: { height: "100%" } },
        { id: 4, text: "4", styles: { height: "25%" } },
        { id: 5, text: "5", styles: { height: "35%" } },
      ],
      container: { display: "flex", gap: "8px", alignItems: "end" },
    },
  },
  {
    name: i18n("system.flexbox.layouts.rowWrap"),
    icon: "rowWrap",
    layout: {
      items: [
        { id: 1, text: "1", styles: { height: "150px", width: "23.5%" } },
        { id: 2, text: "2", styles: { height: "150px", width: "23.5%" } },
        { id: 3, text: "3", styles: { height: "150px", width: "23.5%" } },
        { id: 4, text: "4", styles: { height: "150px", width: "23.5%" } },
        { id: 5, text: "5", styles: { height: "150px", width: "23.5%" } },
        { id: 6, text: "6", styles: { height: "150px", width: "23.5%" } },
        { id: 7, text: "7", styles: { height: "150px", width: "23.5%" } },
        { id: 8, text: "8", styles: { height: "150px", width: "23.5%" } },
        { id: 9, text: "9", styles: { height: "150px", width: "23.5%" } },
        { id: 10, text: "10", styles: { height: "150px", width: "23.5%" } },
        { id: 11, text: "11", styles: { height: "150px", width: "23.5%" } },
        { id: 12, text: "12", styles: { height: "150px", width: "23.5%" } },
        { id: 13, text: "13", styles: { height: "150px", width: "23.5%" } },
        { id: 14, text: "14", styles: { height: "150px", width: "23.5%" } },
      ],
      container: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        alignContent: "start",
      },
    },
  },
  {
    name: i18n("system.flexbox.layouts.verticalStack"),
    icon: "verticalStack",
    layout: {
      items: [
        { id: 1, text: "1", styles: { width: "250px", flexGrow: 1 } },
        { id: 2, text: "2", styles: { width: "250px", flexGrow: 1 } },
        { id: 3, text: "3", styles: { width: "250px", flexGrow: 1 } },
        { id: 4, text: "4", styles: { width: "250px", flexGrow: 1 } },
      ],
      container: {
        display: "flex",
        gap: "8px",
        flexDirection: "column",
        alignItems: "center",
      },
    },
  },
];
