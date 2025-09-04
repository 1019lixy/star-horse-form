# Component Configuration System

This document explains how the component configuration system works in the Star Horse Lowcode project.

## Overview

The component configuration system allows you to define properties for each component in a centralized configuration file. When a component is selected in the Flex Designer, the properties panel will automatically display the relevant configuration options for that component.

## Configuration File

The main configuration file is located at:
`src/components/formcomp/pageitems/componentConfig.ts`

This file exports:
1. `ComponentProperty` interface - defines the structure of a component property
2. `ComponentConfig` interface - defines the structure of a component configuration
3. `componentConfigs` object - contains the configuration for all components
4. `chartTypes` array - contains the available chart types for chart components

## Component Property Structure

Each component property has the following structure:

```typescript
interface ComponentProperty {
  name: string;                    // Property name (must match the component prop name)
  label: string;                   // Display label in the properties panel
  type: string;                    // Input type (input, number, select, switch, etc.)
  defaultValue?: any;             // Default value for the property
  placeholder?: string;           // Placeholder text for input fields
  required?: boolean;             // Whether the property is required
  options?: Array<{ label: string; value: string | number }>; // Options for select, radio, checkbox
  min?: number;                   // Minimum value for number inputs
  max?: number;                   // Maximum value for number inputs
  step?: number;                  // Step value for number inputs
  description?: string;           // Additional description for the property
  isComplex?: boolean;            // Whether this is a complex property (like chart options)
  complexType?: 'object' | 'array'; // Type of complex property
}
```

## Component Configuration Structure

Each component configuration has the following structure:

```typescript
interface ComponentConfig {
  name: string;        // Component name (e.g., 'pform-item')
  label: string;       // Display label (e.g., '表单')
  category: string;    // Component category (e.g., '表单组件')
  properties: ComponentProperty[]; // Array of properties for this component
}
```

## Adding a New Component

To add configuration for a new component:

1. Open `src/components/formcomp/pageitems/componentConfig.ts`
2. Add a new entry to the `componentConfigs` object:
```typescript
'pnewcomponent-item': {
  name: 'pnewcomponent-item',
  label: '新组件',
  category: '展示组件',
  properties: [
    {
      name: 'title',
      label: '标题',
      type: 'input',
      placeholder: '请输入标题'
    },
    // Add more properties as needed
  ]
}
```

## Supported Property Types

The system supports the following property types:

1. `input` - Text input field
2. `number` - Number input field (with min, max, step options)
3. `select` - Dropdown select (requires options array)
4. `switch` - Boolean switch
5. `textarea` - Multi-line text input
6. `color` - Color picker
7. `slider` - Slider control (with min, max, step options)
8. `radio` - Radio button group (requires options array)
9. `checkbox` - Checkbox group (requires options array)
10. `date` - Date picker
11. `time` - Time picker
12. `json` - JSON editor for complex objects (like chart options)

## Complex Properties (like Chart Options)

For complex properties such as chart options, the system provides a JSON editor that allows you to configure the full ECharts configuration object. 

For example, the chart-item component has an `option` property that accepts the full ECharts configuration:

```typescript
{
  name: 'option',
  label: '图表配置',
  type: 'json',
  defaultValue: {},
  isComplex: true,
  complexType: 'object',
  description: 'ECharts 图表配置选项'
}
```

When you click the "配置 图表配置" button in the properties panel, a JSON editor dialog will open where you can enter the complete ECharts configuration.

### Example Chart Configuration

Here's an example of a complete ECharts configuration for a bar chart:

```json
{
  "title": {
    "text": "销量统计"
  },
  "tooltip": {},
  "xAxis": {
    "type": "category",
    "data": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
  },
  "yAxis": {
    "type": "value"
  },
  "series": [
    {
      "data": [120, 200, 150, 80, 70, 110, 130],
      "type": "bar"
    }
  ]
}
```

### Default Chart Options

The system can provide default chart options based on the chart type. For example, when you select "柱状图" as the chart type, the system could automatically generate a basic bar chart configuration.

## How It Works

1. When a component is selected in the Flex Designer, the `FlexItem` component emits a `selectItem` event
2. The `StarHorseFlexComp` component receives this event and updates the `currentId` 
3. The `PageItemProperties` component watches the `currentId` and retrieves the selected component's data from the store
4. It determines the component type and looks up the configuration in `componentConfigs`
5. It renders the appropriate form controls based on the configuration
6. When a property is changed, it updates the component data in the store
7. For complex properties (like chart options), a JSON editor dialog is provided

## Customizing Properties

You can customize any property by modifying its configuration in the `componentConfigs` object. For example, to change the default height of a chart:

```typescript
'chart-item': {
  // ... other properties
  properties: [
    // ... other properties
    {
      name: 'height',
      label: '高度',
      type: 'input',
      defaultValue: '500px',  // Changed from '400px' to '500px'
      placeholder: '例如: 500px'
    }
  ]
}
```

## Accessing Configuration in Code

You can access the component configurations in your code by importing them:

```typescript
import { componentConfigs, chartTypes } from "@/components/formcomp/pageitems/componentConfig";

// Get configuration for a specific component
const formConfig = componentConfigs['pform-item'];

// Get available chart types
console.log(chartTypes);
```