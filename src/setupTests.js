import '@testing-library/jest-dom';
import { vi } from "vitest";

// Mock the axios instance used in the app
vi.mock("./utils/Api", () => {
  return {
    default: {
      get: vi.fn().mockResolvedValue({ data: { data: [] } }),
      post: vi.fn().mockResolvedValue({ data: { data: {} } }),
      put: vi.fn().mockResolvedValue({ data: { data: [] } }),
      delete: vi.fn().mockResolvedValue({ data: { data: {} } }),
    },
  };
});