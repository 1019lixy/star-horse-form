import {App, defineAsyncComponent} from 'vue';

const items = import.meta.glob('@/views/workflow/plugin/node/*.vue');
export default function install(app: App<Element>) {
  for (const [key, value] of Object.entries(items)) {
    const name = key.slice(key.lastIndexOf('/') + 1, key.lastIndexOf('.'));
    app.component(name, defineAsyncComponent(value));
  }
}
