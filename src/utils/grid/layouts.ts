import { GridContainer, GridItem } from '@/components/types/GridType';

export interface Layout {
  name: string;
  icon: string;
  layout: {
    items: GridItem[];
    container: GridContainer;
  };
}

export const gridLayouts: Layout[] = [
  {
    name: '分层布局',
    icon: 'pancakeStack',
    layout: {
      items: [
        { id: 1, text: 'Header', styles: {} },
        { id: 2, text: 'Main', styles: {} },
        { id: 3, text: 'Footer', styles: {} },
      ],
      container: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '100px 1fr 100px',
        gap: '10px 10px',
      },
    },
  },
  {
    name: '侧边栏布局',
    icon: 'sidebar',
    layout: {
      items: [
        { id: 1, text: 'Sidebar', styles: {} },
        { id: 2, text: 'Content', styles: {} },
      ],
      container: {
        display: 'grid',
        gridTemplateColumns: '30% 1fr',
        gridTemplateRows: '1fr',
        gap: '10px 10px',
      },
    },
  },
  {
    name: 'HTML5布局',
    icon: 'html5',
    layout: {
      items: [
        { id: 1, text: 'Header', styles: { gridColumn: '1 / 3' } },
        { id: 2, text: 'Sidebar', styles: {} },
        { id: 3, text: 'Content', styles: {} },
        { id: 4, text: 'Footer', styles: { gridColumn: '1 / 3' } },
      ],
      container: {
        display: 'grid',
        gridTemplateColumns: '30% 1fr',
        gridTemplateRows: '100px 1fr 100px',
        gap: '10px 10px',
      },
    },
  },
  {
    name: 'HTML5布局-2',
    icon: 'html5-2',
    layout: {
      items: [
        { id: 1, text: '1', styles: { gridColumn: '1 / 4' } },
        { id: 2, text: '2', styles: {} },
        { id: 3, text: '3', styles: {} },
        { id: 4, text: '4', styles: {} },
        { id: 5, text: '5', styles: { gridColumn: '1 / 4' } },
      ],
      container: {
        display: 'grid',
        gridTemplateColumns: '100px 1fr 100px',
        gridTemplateRows: '100px 1fr 100px',
        gap: '10px 10px',
      },
    },
  },
  {
    name: '12列网格系统',
    icon: 'columnSystem',
    layout: {
      items: [
        { id: 1, text: 'Header', styles: { gridColumn: '1 / -1' } },
        {
          id: 2,
          text: 'Sidebar',
          styles: { gridRow: '2 / 4', gridColumn: '1 / 4' },
        },
        { id: 3, text: 'Navigation', styles: { gridColumn: '4 / 10' } },
        {
          id: 4,
          text: 'Ads',
          styles: { gridRow: '2 / 4', gridColumn: '10 / 13' },
        },
        {
          id: 5,
          text: 'Main',
          styles: { gridColumn: '4 / 10', gridRow: '3 / 4' },
        },
        { id: 6, text: 'Footer', styles: { gridColumn: '1 / -1' } },
      ],
      container: {
        display: 'grid',
        // gridTemplateColumns: "25% 1fr 25%",
        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
        gridTemplateRows: '100px 100px 1fr 100px',
        gap: '10px 10px',
      },
    },
  },
  {
    name: '拼贴布局',
    icon: 'collage',
    layout: {
      items: [
        {
          id: 1,
          text: '1',
          styles: { gridRow: '1 / 2', gridColumn: '1 / 3' },
        },
        {
          id: 2,
          text: '2',
          styles: { gridRow: '2 / 4', gridColumn: '2 / 4' },
        },
        {
          id: 3,
          text: '3',
          styles: { gridRow: '1 / 2', gridColumn: '3 / 4' },
        },
        {
          id: 4,
          text: '4',
          styles: { gridRow: '1 / 3', gridColumn: '4 / 5' },
        },
        {
          id: 5,
          text: '5',
          styles: { gridRow: '3 / 5', gridColumn: '1 / 2' },
        },
        {
          id: 6,
          text: '6',
          styles: { gridRow: '3 / 4', gridColumn: '4 / 5' },
        },
        {
          id: 7,
          text: '7',
          styles: { gridRow: '4 / 5', gridColumn: '3 / 5' },
        },
        {
          id: 8,
          text: '8',
          styles: { gridRow: '4 / 5', gridColumn: '2 / 3' },
        },
        {
          id: 9,
          text: '9',
          styles: { gridRow: '2 / 3', gridColumn: '1 / 2' },
        },
      ],
      container: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr 1fr 1fr',
        gap: '10px 10px',
      },
    },
  },
  {
    name: '3x3 网格',
    icon: 'grid3x3',
    layout: {
      items: [
        { id: 1, text: '1', styles: {} },
        { id: 2, text: '2', styles: {} },
        { id: 3, text: '3', styles: {} },
        { id: 4, text: '4', styles: {} },
        { id: 5, text: '5', styles: {} },
        { id: 6, text: '6', styles: {} },
        { id: 7, text: '7', styles: {} },
        { id: 8, text: '8', styles: {} },
        { id: 9, text: '9', styles: {} },
      ],
      container: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr 1fr',
        gap: '10px 10px',
      },
    },
  },
  {
    name: '4x4 网格',
    icon: 'grid4x4',
    layout: {
      items: [
        { id: 1, text: '1', styles: {} },
        { id: 2, text: '2', styles: {} },
        { id: 3, text: '3', styles: {} },
        { id: 4, text: '4', styles: {} },
        { id: 5, text: '5', styles: {} },
        { id: 6, text: '6', styles: {} },
        { id: 7, text: '7', styles: {} },
        { id: 8, text: '8', styles: {} },
        { id: 9, text: '9', styles: {} },
        { id: 10, text: '10', styles: {} },
        { id: 11, text: '11', styles: {} },
        { id: 12, text: '12', styles: {} },
        { id: 13, text: '13', styles: {} },
        { id: 14, text: '14', styles: {} },
        { id: 15, text: '15', styles: {} },
        { id: 16, text: '16', styles: {} },
      ],
      container: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr 1fr 1fr',
        gap: '10px 10px',
      },
    },
  },
  {
    name: '无限行布局',
    icon: 'infiniteRows',
    layout: {
      items: [
        { id: 1, text: '1', styles: {} },
        { id: 2, text: '2', styles: {} },
        { id: 3, text: '3', styles: {} },
        { id: 4, text: '4', styles: {} },
        { id: 5, text: '5', styles: {} },
        { id: 6, text: '6', styles: {} },
        { id: 7, text: '7', styles: {} },
        { id: 8, text: '8', styles: {} },
        { id: 9, text: '9', styles: {} },
      ],
      container: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr',
        gridAutoRows: '1fr',
        gap: '10px 10px',
      },
    },
  },
  {
    name: '无限列布局',
    icon: 'infiniteColumns',
    layout: {
      items: [
        { id: 1, text: '1', styles: {} },
        { id: 2, text: '2', styles: {} },
        { id: 3, text: '3', styles: {} },
        { id: 4, text: '4', styles: {} },
        { id: 5, text: '5', styles: {} },
        { id: 6, text: '6', styles: {} },
        { id: 7, text: '7', styles: {} },
        { id: 8, text: '8', styles: {} },
        { id: 9, text: '9', styles: {} },
      ],
      container: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr 1fr 1fr',
        gridAutoColumns: '1fr',
        gridAutoFlow: 'column',
        gap: '10px 10px',
      },
    },
  },
];
