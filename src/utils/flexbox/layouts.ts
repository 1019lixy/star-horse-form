import { FlexboxContainer, FlexboxItem } from "@/components/types/FlexType";
import { overflow } from "html2canvas/dist/types/css/property-descriptors/overflow.js";

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
      name: "填充空间",
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
      name: "中部拉伸",
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
      name: "HTML5布局",
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
            gap:"8px",
            flexWrap: "wrap",
            alignContent: "start",
         },
      },
   },
   {
      name: "交替网格",
      icon: "alternatingGrid",
      layout: {
         items: [
            { id: 1, text: "1", styles: { flexGrow: 1 } },
            { id: 2, text: "2", styles: { flexGrow: 1 } },
            { id: 3, text: "3", styles: { width: "100%" } },
            { id: 4, text: "4", styles: { flexGrow: 1 } },
            { id: 5, text: "5", styles: { flexGrow: 1 } },
         ],
         container: { display: "flex", gap:"8px", flexWrap: "wrap" },
      },
   },
   {
      name: "瀑布流列布局",
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
            gap:"8px",
            flexWrap: "wrap",
         },
      },
   },
   {
      name: "瀑布流行布局",
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
            gap:"8px",
            flexWrap: "wrap",
         },
      },
   },
   {
      name: "3x3网格",
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
         container: { display: "flex", gap:"8px", flexWrap: "wrap" },
      },
   },
   {
      name: "4x4 网格",
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
         container: { display: "flex", gap:"8px", flexWrap: "wrap" },
      },
   },
   {
      name: "居中对齐",
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
            gap:"8px",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
         },
      },
   },
   {
      name: "右侧填充",
      icon: "fillRemainingSpace",
      layout: {
         items: [
            { id: 1, text: "1", styles: { height: "150px" } },
            { id: 2, text: "2", styles: { height: "150px" } },
            { id: 3, text: "3", styles: { height: "150px", flexGrow: 1 } },
         ],
         container: { display: "flex", gap:"8px", flexWrap: "wrap" },
      },
   },
   {
      name: "居中填充",
      icon: "fillRemainingSpace2",
      layout: {
         items: [
            { id: 1, text: "1", styles: { height: "150px" } },
            { id: 2, text: "2", styles: { height: "150px", flexGrow: 1 } },
            { id: 3, text: "3", styles: { height: "150px" } },
         ],
         container: { display: "flex", gap:"8px", flexWrap: "wrap" },
      },
   },
   {
      name: "水平条布局",
      icon: "horizontalBars",
      layout: {
         items: [
            { id: 1, text: "1", styles: { width: "40%" } },
            { id: 2, text: "2", styles: { width: "80%" } },
            { id: 3, text: "3", styles: { width: "100%" } },
            { id: 4, text: "4", styles: { width: "25%" } },
            { id: 5, text: "5", styles: { width: "35%" } },
         ],
         container: { display: "flex", gap:"8px", flexDirection: "column" },
      },
   },
   {
      name: "垂直条布局",
      icon: "verticalBars",
      layout: {
         items: [
            { id: 1, text: "1", styles: { height: "40%" } },
            { id: 2, text: "2", styles: { height: "80%" } },
            { id: 3, text: "3", styles: { height: "100%" } },
            { id: 4, text: "4", styles: { height: "25%" } },
            { id: 5, text: "5", styles: { height: "35%" } },
         ],
         container: { display: "flex", gap:"8px", alignItems: "end" },
      },
   },
   {
      name: "行换行布局",
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
            gap:"8px",
            flexWrap: "wrap",
            alignContent: "start",
         },
      },
   },
   {
      name: "垂直堆叠布局",
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
            gap:"8px",
            flexDirection: "column",
            alignItems: "center",
         },
      },
   },
];
