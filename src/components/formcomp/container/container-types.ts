import {i18n} from "@/lang";

/**
 * All supported container type identifiers.
 * Used by: isContainer(), excludeContainerType checks, and container registration.
 */
export const CONTAINER_TYPES: ReadonlyArray<string> = [
  "tab",
  "box",
  "table",
  "card",
  "dytable",
  "gridtable",
  "collapse",
  "splitter",
  "step",
  "condition",
  "dialog",
  "drawer",
  "fieldset",
  "descriptions",
  "anchor",
];

/**
 * Check whether a data item is a container type.
 */
export const isContainer = (data: any): boolean =>
  CONTAINER_TYPES.includes(data?.itemType);

/**
 * Container types that cannot nest any other container (leaf-only containers).
 * These containers only accept form fields, not other containers.
 */
export const NO_NEST_CONTAINER_TYPES: ReadonlySet<string> = new Set([
  "box",
  "gridtable",
  "dytable",
  "table",
  "descriptions",
]);

/**
 * Check whether a parent container can accept a child of the given type.
 * Returns false only when the parent is a no-nest container AND the child is a container.
 */
export const canAcceptChild = (
  parentItemType: string,
  childItemType?: string,
): boolean => {
  if (!childItemType) return true;
  if (!CONTAINER_TYPES.includes(childItemType)) return true;
  return !NO_NEST_CONTAINER_TYPES.has(parentItemType);
};

/**
 * Public props shared by all container components.
 */
export interface ContainerProps {
  parentField?: any;
  isDesign?: boolean;
  showFormItem?: boolean;
  disabled?: boolean | string;
  formInfo?: any;
  field?: any;
  compSize?: string;
}

/**
 * A single section/block inside a container's `preps.elements` array.
 */
export interface ContainerSection {
  label: string;
  subTablePrimaryKey: string;
  subTableName: string;
  subFormFlag: "Y" | "N";
  formVisible?: "Y" | "N";
  items: any[];
  [key: string]: any;
}

/**
 * Create a single default section.
 * @param label - display label
 * @param key - subTablePrimaryKey / subTableName
 * @param extra - additional fields merged into the section
 */
export function createDefaultSection(
  label: string,
  key: string,
  extra: Record<string, any> = {},
): ContainerSection {
  return {
    label,
    subTablePrimaryKey: key,
    subTableName: key,
    subFormFlag: "Y",
    formVisible: "Y",
    items: [],
    ...extra,
  };
}

/**
 * Create default elements array for a given container type.
 * Centralizes the onMounted initialization logic that was duplicated across
 * card / tab / collapse / dialog / drawer / fieldset / descriptions / splitter / step / anchor.
 *
 * @param itemType - the container's itemType (e.g. "card", "tab", "anchor")
 * @param itemName - the display name from the component definition (used as fallback label)
 * @returns {{ elements: ContainerSection[], extraPreps?: Record<string, any> }}
 */
export function createDefaultElements(
  itemType: string,
  itemName?: string,
): {
  elements: ContainerSection[];
  extraPreps?: Record<string, any>;
} {
  switch (itemType) {
    case "card":
      return {
        elements: [
          createDefaultSection("Card", "card", { headerFieldList: [] }),
        ],
        extraPreps: { stretch: "N" },
      };
    case "tab":
      return {
        elements: [
          createDefaultSection("Tab1", "tab1"),
          createDefaultSection("Tab2", "tab2"),
        ],
        extraPreps: { stretch: "N" },
      };
    case "collapse":
      return {
        elements: [
          createDefaultSection("Collapse1", "collapse1"),
          createDefaultSection("Collapse2", "collapse2"),
        ],
      };
    case "splitter":
      return {
        elements: [
          createDefaultSection("Splitter1", "splitter1", {
            resizable: true,
            collapsible: false,
          }),
          createDefaultSection("Splitter2", "splitter2", {
            resizable: true,
            collapsible: false,
          }),
        ],
      };
    case "step":
      return {
        elements: [
          createDefaultSection("步骤1", "step1", {
            sameForm: false,
            showStepBar: true,
            showNavButtons: true,
            direction: "horizontal",
            stepStyle: "process",
            mustCompleteStep: true,
          }),
          createDefaultSection("步骤2", "step2", {
            sameForm: false,
            showStepBar: true,
            showNavButtons: true,
            direction: "horizontal",
            stepStyle: "process",
            mustCompleteStep: true,
          }),
        ],
      };
    case "anchor": {
      const prefix = i18n("dyform.container.anchorSection");
      return {
        elements: [
          createDefaultSection(`${prefix} 1`, "anchor1", {
            anchorTitle: "",
            anchorHref: "",
            anchorIcon: "",
            anchorDisabled: false,
          }),
          createDefaultSection(`${prefix} 2`, "anchor2", {
            anchorTitle: "",
            anchorHref: "",
            anchorIcon: "",
            anchorDisabled: false,
          }),
        ],
      };
    }
    case "dialog":
      return { elements: [createDefaultSection("Dialog", "dialog")] };
    case "drawer":
      return { elements: [createDefaultSection("Drawer", "drawer")] };
    case "fieldset":
      return { elements: [createDefaultSection("Fieldset", "fieldset")] };
    case "descriptions":
      return {
        elements: [createDefaultSection("Descriptions", "descriptions")],
      };
    default:
      return {
        elements: [createDefaultSection(itemName || itemType, itemType)],
      };
  }
}

/**
 * Ensure `field.preps` and `field.preps.elements` exist.
 * If not, initialize with default elements for the given container type.
 * This is the idempotent onMounted guard used by all container components.
 *
 * @param field - the container's field object
 * @param itemType - the container's itemType
 * @param itemName - optional display name fallback
 * @returns the elements array (after ensuring it exists)
 */
export function ensureDefaultElements(
  field: any,
  itemType: string,
  itemName?: string,
): any[] {
  if (!field["preps"]) field["preps"] = {};
  if (!field["preps"]?.["elements"]) {
    const { elements, extraPreps } = createDefaultElements(itemType, itemName);
    field["preps"]["elements"] = elements;
    if (extraPreps) {
      for (const key in extraPreps) {
        field[key] = extraPreps[key];
      }
    }
  }
  return field["preps"]["elements"];
}
