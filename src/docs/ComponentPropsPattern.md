# Component Properties Pattern

This document explains the new pattern for handling component properties in the Star Horse Lowcode platform.

## Overview

Instead of defining individual props for each component, we now use a standardized approach:
- All configurable properties are packaged in a `preps` object
- All style-related properties are packaged in a `styles` object
- Components receive these objects and extract what they need
- This makes it easier to add new properties without modifying component files

## Benefits

1. **Easier Maintenance**: Adding new props doesn't require modifying component files
2. **Flexibility**: Form data can be directly passed to components
3. **Consistency**: All components follow the same pattern
4. **Scalability**: Easy to extend with new properties

## Implementation

### Component Structure

```vue
<script setup lang="ts">
defineOptions({
  name: "PageComponentName",
});

// Package all props into preps and styles objects
const props = defineProps({
  preps: {
    type: Object,
    default: () => ({})
  },
  styles: {
    type: Object,
    default: () => ({})
  }
});

// Extract props from preps with defaults
const title = props.preps?.title || "Default Title";
const content = props.preps?.content || "Default Content";

// Style properties
const backgroundColor = props.preps?.backgroundColor || "#ffffff";
const textColor = props.preps?.textColor || "#000000";

// Merge all styles
const mergedStyles = {
  backgroundColor,
  color: textColor,
  ...props.styles // Allow overriding with explicit styles prop
};
</script>

<template>
  <div :style="mergedStyles">
    <h3>{{ title }}</h3>
    <p>{{ content }}</p>
  </div>
</template>
```

### Configuration Structure

In `componentConfig.ts`, properties are defined with dot notation:

```typescript
{
  name: "pcomponent-item",
  label: "Component Name",
  category: "展示组件",
  properties: [
    {
      name: "preps.title",
      label: "标题",
      type: "input",
      defaultValue: "默认标题",
      placeholder: "请输入标题",
    },
    {
      name: "preps.content",
      label: "内容",
      type: "textarea",
      defaultValue: "默认内容",
    },
    {
      name: "preps.backgroundColor",
      label: "背景颜色",
      type: "color",
      defaultValue: "#ffffff",
    },
    // ... more properties
  ]
}
```

### Usage in FlexItem.vue

Components are rendered with the new pattern:

```vue
<component
  :is="data.name + '-item'"
  :preps="data.preps"
  :styles="data.styles || {}"
/>
```

### Property Handling in PageItemProperties.vue

The properties panel now handles nested properties:

```typescript
// Getting nested properties
const value = getNestedProperty(component, "preps.title");

// Setting nested properties
setNestedProperty(form.preps, "title", newValue);
```

## Migration Guide

To migrate existing components to this new pattern:

1. Update the component file to accept `preps` and `styles` props
2. Extract individual properties from the `preps` object with defaults
3. Update the component configuration in `componentConfig.ts` to use dot notation
4. Ensure the FlexItem.vue passes the correct props

## Example Implementation

See `pdemo-item.vue` for a complete example of this pattern.