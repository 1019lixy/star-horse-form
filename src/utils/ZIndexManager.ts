/**
 * ZIndexManager.ts
 * Utility functions for managing component z-index in the lowcode platform
 */

/**
 * Bring a component to the front by setting its z-index higher than all others
 * @param componentList - List of components in the container
 * @param componentId - ID of the component to bring to front
 */
export function bringToFront(componentList: any[], componentId: string): void {
  const component = componentList.find((comp) => comp.id === componentId);
  if (!component) return;

  // Initialize styles if not present
  if (!component.styles) {
    component.styles = {};
  }

  // Find the maximum z-index among all components
  const maxZIndex = Math.max(
    ...componentList.map((comp) => parseInt(comp.styles?.zIndex) || 0),
    0,
  );

  // Set this component's z-index to one higher than the maximum
  component.styles.zIndex = maxZIndex + 1;
}

/**
 * Send a component to the back by setting its z-index lower than all others
 * @param componentList - List of components in the container
 * @param componentId - ID of the component to send to back
 */
export function sendToBack(componentList: any[], componentId: string): void {
  const component = componentList.find((comp) => comp.id === componentId);
  if (!component) return;

  // Initialize styles if not present
  if (!component.styles) {
    component.styles = {};
  }

  // Find the minimum z-index among all components
  const minZIndex = Math.min(
    ...componentList.map((comp) => parseInt(comp.styles?.zIndex) || 0),
    0,
  );

  // Set this component's z-index to one lower than the minimum
  component.styles.zIndex = minZIndex - 1;
}

/**
 * Set a specific z-index value for a component
 * @param componentList - List of components in the container
 * @param componentId - ID of the component to update
 * @param zIndex - The z-index value to set
 */
export function setZIndex(
  componentList: any[],
  componentId: string,
  zIndex: number,
): void {
  const component = componentList.find((comp) => comp.id === componentId);
  if (!component) return;

  // Initialize styles if not present
  if (!component.styles) {
    component.styles = {};
  }

  // Set the specified z-index
  component.styles.zIndex = zIndex;
}

/**
 * Get the current z-index of a component
 * @param componentList - List of components in the container
 * @param componentId - ID of the component to check
 * @returns The current z-index value or 0 if not set
 */
export function getZIndex(componentList: any[], componentId: string): number {
  const component = componentList.find((comp) => comp.id === componentId);
  if (!component) return 0;

  return parseInt(component.styles?.zIndex) || 0;
}

/**
 * Normalize z-index values to prevent negative values and ensure proper ordering
 * @param componentList - List of components in the container
 */
export function normalizeZIndexes(componentList: any[]): void {
  // Get all components with z-index values and sort them
  const componentsWithZIndex = componentList
    .filter((comp) => comp.styles?.zIndex !== undefined)
    .sort(
      (a, b) =>
        (parseInt(a.styles.zIndex) || 0) - (parseInt(b.styles.zIndex) || 0),
    );

  // Assign normalized z-index values starting from 1
  componentsWithZIndex.forEach((component, index) => {
    component.styles.zIndex = index + 1;
  });
}

/**
 * Reset all z-index values to default (1)
 * @param componentList - List of components in the container
 */
export function resetZIndexes(componentList: any[]): void {
  componentList.forEach((component) => {
    if (component.styles) {
      delete component.styles.zIndex;
    }
  });
}

export default {
  bringToFront,
  sendToBack,
  setZIndex,
  getZIndex,
  normalizeZIndexes,
  resetZIndexes,
};
