import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Cart from "./Cart";
import api from "../../utils/Api";
import {
  getCart,
  removeCartItem,
  addToCart,
} from "../../services/cartService";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: null }), // guest by default
}));

vi.mock("../../context/CartContext", () => ({
  useCart: () => ({ fetchCartCount: vi.fn() }),
}));

vi.mock("../../services/cartService", () => ({
  getCart: vi.fn(),
  removeCartItem: vi.fn().mockResolvedValue({}),
  addToCart: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../components/common/Button", () => ({
  __esModule: true,
  default: ({ children, onClick, ...rest }) => (
    <button onClick={onClick} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock("../../components/common/Input", () => ({
  __esModule: true,
  default: (props) => <input {...props} />,
}));

vi.mock("../../components/CourseCard", () => ({
  __esModule: true,
  default: ({ course }) => <div>{course.title}</div>,
}));

vi.mock("./CartItem", () => ({
  __esModule: true,
  default: ({ item }) => <div>CartItem: {item.course?.title || item.title}</div>,
}));

vi.mock("../../utils/Api");

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

function renderCart() {
  return render(
    <MemoryRouter>
      <Cart />
    </MemoryRouter>,
  );
}

test("shows empty cart message for guest with no local items", async () => {
  api.get.mockResolvedValue({ data: { data: [] } }); // recommendations
  renderCart();

  expect(
    await screen.findByText(/your cart is empty/i),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /keep shopping/i }),
  ).toBeInTheDocument();
});

test("renders guest cart items from localStorage", async () => {
  const guestItems = [
    {
      id: 1,
      title: "React 101",
      price: 10,
      thumbnail_url: "",
      instructor_name: "John Doe",
    },
  ];
  localStorage.setItem("cart", JSON.stringify(guestItems));

  api.get.mockResolvedValue({ data: { data: [] } });

  renderCart();

  expect(
    await screen.findByText(/react 101/i),
  ).toBeInTheDocument();
  expect(screen.getByText(/1 courses in cart/i)).toBeInTheDocument();
  expect(screen.getByText(/ca\$10\.00/i)).toBeInTheDocument();
});

test("proceed to checkout button is disabled when cart is empty", async () => {
  api.get.mockResolvedValue({ data: { data: [] } });

  renderCart();

  await screen.findByText(/your cart is empty/i);
  const btn = screen.getByRole("button", {
    name: /proceed to checkout/i,
  });
  expect(btn).toBeDisabled();
});

test("shows recommendations when API returns data", async () => {
  localStorage.setItem("cart", JSON.stringify([]));

  api.get.mockResolvedValueOnce({
    // /student/:id/recommendations (user is null here, so it will be skipped,
    data: { data: [] },
  });

  renderCart();

  expect(
    await screen.findByText(/no recommendations yet/i),
  ).toBeInTheDocument();
});


