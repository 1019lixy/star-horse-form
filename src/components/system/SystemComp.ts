import { App, defineAsyncComponent } from "vue";

// @ts-ignore
const items = import.meta.glob("@/components/system/*.vue");
export default function install(app: App<Element>) {
  for (const [key, value] of Object.entries(items)) {
    const name = key.slice(key.lastIndexOf("/") + 1, key.lastIndexOf("."));
    // @ts-ignore
    app.component(name, defineAsyncComponent(value));
  }
}
