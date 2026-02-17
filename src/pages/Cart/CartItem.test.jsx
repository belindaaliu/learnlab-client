import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CartItem from "./CartItem";

const baseCourse = {
  id: 1,
  title: "React Mastery",
  price: 49,
  original_price: 99,
  Users: { id: 10, first_name: "John", last_name: "Doe" },
};

test("renders title, instructor, and price with discount", () => {
  const item = { id: 123, course: baseCourse };

  render(
    <MemoryRouter>
      <CartItem item={item} onRemove={vi.fn()} />
    </MemoryRouter>,
  );

  expect(screen.getByText(/react mastery/i)).toBeInTheDocument();
  expect(screen.getByText(/john doe/i)).toBeInTheDocument();
  expect(screen.getByText("CA$49.00")).toBeInTheDocument();
  expect(screen.getByText("CA$99.00")).toBeInTheDocument();
  expect(screen.getByText(/% off/i)).toBeInTheDocument();
});

test("calls onRemove with item id when clicking Remove", async () => {
  const user = userEvent.setup();
  const handleRemove = vi.fn();
  const item = { id: 123, course: baseCourse };

  render(
    <MemoryRouter>
      <CartItem item={item} onRemove={handleRemove} />
    </MemoryRouter>,
  );

  await user.click(screen.getByRole("button", { name: /remove/i }));
  expect(handleRemove).toHaveBeenCalledWith(123);
});

test("shows FREE badge when price is 0", () => {
  const freeCourse = { ...baseCourse, price: 0, original_price: 0 };
  const item = { id: 124, course: freeCourse };

  render(
    <MemoryRouter>
      <CartItem item={item} onRemove={vi.fn()} />
    </MemoryRouter>,
  );

  expect(screen.getByText(/free/i)).toBeInTheDocument();
});

test("shows PREMIUM badge for paid course", () => {
  const item = { id: 125, course: baseCourse };

  render(
    <MemoryRouter>
      <CartItem item={item} onRemove={vi.fn()} />
    </MemoryRouter>,
  );

  expect(screen.getByText(/premium/i)).toBeInTheDocument();
});
