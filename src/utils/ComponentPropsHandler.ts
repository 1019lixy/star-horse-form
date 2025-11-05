/**
 * Utility functions for handling component properties with preps and styles pattern
 */

/**
 * Get nested property value from an object
 * @param obj The object to get the property from
 * @param path The dot-notation path to the property (e.g., "preps.content.backgroundColor")
 * @returns The property value or undefined if not found
 */
export const getNestedProperty = (obj: any, path: string): any => {
  if (!obj || !path) return undefined;

  const parts = path.split(".");
  let current = obj;

  for (const part of parts) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }
    current = current[part];
  }

  return current;
};

/**
 * Set nested property value in an object
 * @param obj The object to set the property in
 * @param path The dot-notation path to the property (e.g., "preps.content.backgroundColor")
 * @param value The value to set
 */
export const setNestedProperty = (obj: any, path: string, value: any) => {
  if (!obj || !path) return;

  const parts = path.split(".");
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }

  current[parts[parts.length - 1]] = value;
};

/**
 * Extract root property name from a nested path
 * @param path The dot-notation path (e.g., "preps.content.backgroundColor")
 * @returns The root property name (e.g., "preps")
 */
export const getRootProperty = (path: string): string => {
  return path.split(".")[0];
};

/**
 * Extract nested path relative to root
 * @param path The dot-notation path (e.g., "preps.content.backgroundColor")
 * @returns The nested path (e.g., "content.backgroundColor")
 */
export const getNestedPath = (path: string): string => {
  const parts = path.split(".");
  return parts.slice(1).join(".");
};

/**
 * Group properties by their root (preps, styles, etc.)
 * @param properties Array of property configurations
 * @returns Object with root property names as keys and grouped properties as values
 */
export const groupPropertiesByRoot = (properties: any[]) => {
  const groups: Record<string, any[]> = {};

  properties.forEach((prop) => {
    const root = getRootProperty(prop.name);
    if (!groups[root]) {
      groups[root] = [];
    }
    groups[root].push(prop);
  });

  return groups;
};
