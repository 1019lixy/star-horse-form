import { App, defineAsyncComponent } from "vue";

// @ts-ignore
const items = import.meta.glob("@/components/formcomp/pageitems/*.vue");

// @ts-ignore
const chartItems = import.meta.glob("@/components/formcomp/charts/*-item.vue");

export default function install(app: App<Element>) {
  // Register page items
  for (const [key, value] of Object.entries(items)) {
    const name = key.slice(key.lastIndexOf("/") + 1, key.lastIndexOf("."));
    app.component(name, defineAsyncComponent(value as any));
  }
  
  // Register chart items
  for (const [key, value] of Object.entries(chartItems)) {
    const name = key.slice(key.lastIndexOf("/") + 1, key.lastIndexOf("."));
    app.component(name, defineAsyncComponent(value as any));
  }
}