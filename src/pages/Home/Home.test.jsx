import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";
import api from "../../utils/Api";

// --- Mocks ---

// useAuth: guest user by default
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

// useCart: just a no-op fetchCartCount
vi.mock("../../context/CartContext", () => ({
  useCart: () => ({ fetchCartCount: vi.fn() }),
}));

// mock addToCart service so clicking “add to cart” won’t hit backend
vi.mock("../../services/cartService", () => ({
  addToCart: vi.fn().mockResolvedValue({}),
}));

// api is globally mocked in setupTests, but we also use it here to override per test
vi.mock("../../utils/Api");

// reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

test("renders hero content and featured courses section", () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );

  // hero heading
  expect(screen.getByText(/unlock your/i)).toBeInTheDocument();

  // featured courses heading
  expect(screen.getByText(/featured courses/i)).toBeInTheDocument();

  // stats section label
  expect(screen.getByText(/active students/i)).toBeInTheDocument();
});

test("search form updates value and submits without crash", async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );

  const input = screen.getByPlaceholderText(/what do you want to learn\?/i);
  const button = screen.getByRole("button", { name: /search/i });

  await user.type(input, "react");
  await user.click(button);

  // At least confirm the input updated; navigation is handled by react-router
  expect(input).toHaveValue("react");
});

test("loads featured courses from api and shows fallback when empty", async () => {
  // For this test, return an empty list for /courses call
  api.get.mockResolvedValueOnce({ data: { data: [] } });

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );

  const msg = await screen.findByText(/no courses available at the moment/i);
  expect(msg).toBeInTheDocument();
});
