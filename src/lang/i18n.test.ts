// Test file for i18n function with placeholders
import { i18n } from "./index";

// Mock language data for testing
const mockZhCN = {
  "test.placeholder": "你好 {0}，欢迎来到 {1}",
  "test.no.placeholder": "你好",
  "test.name": "张三",
  "test.site": "星马低代码平台"
};

const mockEnUS = {
  "test.placeholder": "Hello {0}, welcome to {1}",
  "test.no.placeholder": "Hello",
  "test.name": "John",
  "test.site": "StarHorse Lowcode Platform"
};

// Mock the language set for testing
// In a real test, we would use a more sophisticated mocking approach

console.log("Testing i18n function with placeholders...");

// Test 1: String with placeholders
const result1 = i18n("test.placeholder", "张三", "星马低代码平台");
console.log("Test 1 - With placeholders:", result1);

// Test 2: String without placeholders (fallback to concatenation)
const result2 = i18n("test.no.placeholder", "test.name", "test.site");
console.log("Test 2 - Without placeholders:", result2);

console.log("Tests completed.");