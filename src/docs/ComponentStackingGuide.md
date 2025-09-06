# Component Stacking Guide

This document explains how component stacking (z-index management) works in the Star Horse Lowcode platform.

## Overview

The component stacking system allows you to control the layering order of components within a container. This is particularly useful when you want to create overlapping UI elements or ensure certain components appear above others.

## How It Works

### 1. Z-Index Property

Each component now has a `zIndex` property that controls its stacking order:

- Higher `zIndex` values appear in front of components with lower values
- Default `zIndex` is 1 for all components
- You can set `zIndex` values from 0 to 9999

### 2. Implementation Details

The stacking system is implemented through:

1. **Absolute Positioning**: Components are positioned absolutely within their container to allow proper z-index behavior
2. **Z-Index Management**: Each component's `zIndex` is applied as a CSS style
3. **Visual Feedback**: Selected components are highlighted with a border

### 3. Preventing Layout Shifts

To prevent layout shifts when adding new components:

- Components are positioned absolutely within their container
- Container dimensions are fixed and not affected by component additions
- Each component maintains its own positioning without affecting others

## Using the Stacking System

### In the Designer

1. Select a component to open its properties panel
2. Find the "层级" (Z-Index) property in the component settings
3. Adjust the value to control the stacking order:
   - Higher values bring the component to the front
   - Lower values send the component to the back

### Programmatically

You can also manage z-index programmatically using the ZIndexManager utility:

```javascript
import { bringToFront, sendToBack, setZIndex } from '@/utils/ZIndexManager';

// Bring component to front
bringToFront(componentList, componentId);

// Send component to back
sendToBack(componentList, componentId);

// Set specific z-index
setZIndex(componentList, componentId, 10);
```

## Best Practices

1. **Use Reasonable Values**: Keep z-index values within a reasonable range (0-9999)
2. **Avoid Conflicts**: Try to maintain a consistent z-index hierarchy across your application
3. **Test Overlaps**: Always test how components overlap when adjusting z-index values
4. **Consider User Experience**: Ensure important UI elements remain accessible and visible

## Troubleshooting

### Components Not Stacking Properly

1. Check that the `zIndex` property is correctly set in the component's styles
2. Verify that components are within the same container
3. Ensure no CSS conflicts are overriding the z-index values

### Layout Shifts When Adding Components

1. Confirm that components are positioned absolutely
2. Check that container dimensions are fixed
3. Verify that no other CSS properties are causing layout changes

## Future Enhancements

Planned improvements to the stacking system include:

1. Visual stacking order indicators in the designer
2. Group-based z-index management
3. Layer locking to prevent accidental reordering
4. Preset stacking configurations for common UI patterns

## Technical Implementation

The stacking system is implemented with the following key components:

1. **ZIndexManager Utility**: Provides functions for managing z-index values
2. **Component Configuration**: All components now include a z-index property
3. **FlexItem Component**: Updated to support absolute positioning and z-index
4. **PageItemProperties**: Updated to expose z-index controls in the properties panel

The implementation ensures that:
- Components maintain fixed dimensions regardless of additions
- Z-index values are properly managed and updated
- Visual feedback is provided for selected components
- Layout shifts are prevented through absolute positioning