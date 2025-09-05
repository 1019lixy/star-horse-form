import { ref, computed, watch, onMounted } from "vue";
import { validInterface } from "@/views/dyform/utils/ItemPreps";

/**
 * Check if API config is valid (not empty)
 */
export function hasValidApiConfig(apiConfig: any) {
  return (
    apiConfig &&
    typeof apiConfig === "object" &&
    Object.keys(apiConfig).length > 0
  );
}

/**
 * Fetch data from API
 */
export async function fetchData(apiConfig: any) {
  return new Promise((resolve) => {
    try {
      // Create a mock form reference for validInterface
      const mockFormRef = {
        value: {
          getFormData: () => apiConfig,
        },
      };

      // Use the existing validInterface function to make the API call
      validInterface(
        apiConfig,
        mockFormRef,
        (resultData: any, _successMsg: string, errorMsg: string) => {
          if (!errorMsg) {
            // Resolve with the fetched data
            resolve({ data: resultData, error: null });
          } else {
            resolve({ data: null, error: errorMsg });
          }
        },
        false, // Don't validate form
        undefined, // No form data
        false, // Not only URL
      );
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      resolve({ data: null, error: errorMessage });
    }
  });
}

/**
 * Composable for handling API data fetching in components
 * @param apiConfig - The API configuration object
 * @param initialData - Initial static data (if any)
 * @returns Reactive refs and functions for data handling
 */
export function useApiData(apiConfig: any, initialData?: any) {
  // Reactive data ref
  const data: any = ref(initialData || []);

  // Loading state
  const loading = ref(false);

  // Error state
  const error = ref<string | null>(null);

  // Watch for API config changes
  watch(
    () => apiConfig,
    () => {
      fetchData();
    },
    { deep: true },
  );

  // Fetch initial data
  onMounted(() => {
    fetchData();
  });

  // Return computed data
  const computedData = computed(() => {
    return data.value && data.value.length > 0 ? data.value : initialData;
  });

  return {
    data: computedData,
    loading,
    error,
    fetchData,
  };
}
