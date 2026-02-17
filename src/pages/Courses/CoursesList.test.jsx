// src/pages/Courses/CoursesList.test.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CoursesList from "./CoursesList";
import api from "../../utils/Api";

// --- Mocks ---

// guest user by default
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

// cart context
vi.mock("../../context/CartContext", () => ({
  useCart: () => ({ fetchCartCount: vi.fn() }),
}));

// cart service
vi.mock("../../services/cartService", () => ({
  addToCart: vi.fn().mockResolvedValue({}),
}));

// common UI components
vi.mock("../../components/common/Input", () => ({
  __esModule: true,
  default: ({ placeholder, value, onChange }) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  ),
}));

vi.mock("../../components/common/Button", () => ({
  __esModule: true,
  default: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

// CourseCard 
vi.mock("../../components/CourseCard", () => ({
  __esModule: true,
  default: ({ course }) => <div>{course.title}</div>,
}));

// api is globally mocked, but we override responses here
vi.mock("../../utils/Api");

beforeEach(() => {
  vi.clearAllMocks();
});

test("renders heading and initial UI", () => {
  render(
    <MemoryRouter>
      <CoursesList />
    </MemoryRouter>,
  );

  expect(screen.getByText(/browse courses/i)).toBeInTheDocument();
  expect(screen.getByText(/found 0 results/i)).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText(/search \(e\.g\. react\)\.\.\./i),
  ).toBeInTheDocument();
});

test("shows empty state when no courses returned", async () => {
  api.get.mockResolvedValueOnce({ data: { data: [] } }); // /courses

  render(
    <MemoryRouter>
      <CoursesList />
    </MemoryRouter>,
  );

  const emptyMsg = await screen.findByText(/no courses found/i);
  expect(emptyMsg).toBeInTheDocument();
  expect(screen.getByText(/clear all filters/i)).toBeInTheDocument();
});

test("renders returned courses from api", async () => {
  api.get.mockResolvedValueOnce({
    data: {
      data: [
        { id: 1, title: "React Basics", price: 0 },
        { id: 2, title: "Advanced Node", price: 49 },
      ],
    },
  });

  render(
    <MemoryRouter>
      <CoursesList />
    </MemoryRouter>,
  );

  expect(await screen.findByText(/react basics/i)).toBeInTheDocument();
  expect(screen.getByText(/advanced node/i)).toBeInTheDocument();
});

test("updates search filter when typing", async () => {
  const user = userEvent.setup();
  api.get.mockResolvedValue({ data: { data: [] } });

  render(
    <MemoryRouter>
      <CoursesList />
    </MemoryRouter>,
  );

  const input = screen.getByPlaceholderText(/search \(e\.g\. react\)\.\.\./i);
  await user.type(input, "javascript");

  expect(input).toHaveValue("javascript");
});
