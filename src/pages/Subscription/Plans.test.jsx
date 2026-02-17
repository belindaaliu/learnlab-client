import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SubscriptionPlans from "./Plans";
import api from "../../utils/Api";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

vi.mock("../../components/common/Button", () => ({
  __esModule: true,
  default: ({ children, onClick, ...rest }) => (
    <button onClick={onClick} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock("../../components/aiAgent/PlansAgentChat", () => ({
  __esModule: true,
  default: ({ onClose }) => (
    <div>
      Plans Agent Chat
      <button onClick={onClose}>Close Chat</button>
    </div>
  ),
}));

vi.mock("../../components/PlanComparison", () => ({
  __esModule: true,
  default: ({ plans }) => (
    <div>Plan Comparison ({plans.length} plans)</div>
  ),
}));

vi.mock("../../utils/Api");

beforeEach(() => {
  vi.clearAllMocks();
});

function renderPlans() {
  return render(
    <MemoryRouter>
      <SubscriptionPlans />
    </MemoryRouter>,
  );
}

test("shows loading state initially", () => {
  api.get.mockResolvedValueOnce({ data: { data: [] } });

  renderPlans();

  expect(
    screen.getByText(/loading your options/i),
  ).toBeInTheDocument();
});

test("renders plans after api load", async () => {
  api.get.mockResolvedValueOnce({
    // GET /subscription/plans
    data: {
      data: [
        {
          id: 1,
          name: "Starter",
          slug: "starter",
          price: 10,
          duration_days: 30,
          description: "Basic access",
          features: JSON.stringify({ discount_percent: 10 }),
        },
        {
          id: 2,
          name: "VIP",
          slug: "vip",
          price: 29,
          duration_days: 30,
          description: "All features",
          features: JSON.stringify({ all_courses_access: true }),
        },
      ],
    },
  });

  renderPlans();

  expect(
    await screen.findByText(/starter/i),
  ).toBeInTheDocument();
  expect(screen.getByText(/vip/i)).toBeInTheDocument();
  expect(screen.getByText(/\$10\.00/)).toBeInTheDocument();
  expect(screen.getByText(/\$29\.00/)).toBeInTheDocument();
});

test("toggles comparison table", async () => {
  api.get.mockResolvedValueOnce({
    data: {
      data: [
        { id: 1, name: "Starter", slug: "starter", price: 10, duration_days: 30, description: "Basic", features: "{}" },
      ],
    },
  });

  const user = userEvent.setup();
  renderPlans();

  await screen.findByText(/starter/i);

  const toggleBtn = screen.getByRole("button", {
    name: /compare plan features/i,
  });
  await user.click(toggleBtn);

  expect(
    screen.getByText(/plan comparison/i),
  ).toBeInTheDocument();

  // button label should switch to hide
  expect(
    screen.getByRole("button", { name: /hide detailed features/i }),
  ).toBeInTheDocument();
});

test("opens and closes plans agent chat", async () => {
  api.get.mockResolvedValueOnce({
    data: { data: [] },
  });

  const user = userEvent.setup();
  renderPlans();

  await screen.findByText(/invest in your future/i);

  const launcher = screen.getByRole("button", { name: /ask copilot/i });
  await user.click(launcher);

  expect(
    screen.getByText(/plans agent chat/i),
  ).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /close chat/i }));

  expect(
    screen.queryByText(/plans agent chat/i),
  ).not.toBeInTheDocument();
});
