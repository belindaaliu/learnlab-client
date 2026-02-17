import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CourseDetails from "./CourseDetails";
import api from "../../utils/Api";

// Auth: guest user
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

// Cart: stub
vi.mock("../../context/CartContext", () => ({
  useCart: () => ({ fetchCartCount: vi.fn() }),
}));

// cartService
vi.mock("../../services/cartService", () => ({
  addToCart: vi.fn().mockResolvedValue({}),
}));

// Button
vi.mock("../../components/common/Button", () => ({
  __esModule: true,
  default: ({ children, onClick, ...rest }) => (
    <button onClick={onClick} {...rest}>
      {children}
    </button>
  ),
}));

// VideoPreviewModal + ReviewList
vi.mock("../../components/Modals/VideoPreviewModal", () => ({
  __esModule: true,
  default: ({ isOpen }) => (isOpen ? <div>Preview Modal</div> : null),
}));

vi.mock("../../components/ReviewList", () => ({
  __esModule: true,
  default: () => <div>Reviews</div>,
}));

// api
vi.mock("../../utils/Api");

beforeEach(() => {
  vi.clearAllMocks();
});

function renderWithRoute(ui, { route = "/course/1" } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/course/:id" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

test("shows loading then renders course title", async () => {
  api.get
    .mockResolvedValueOnce({
      data: {
        data: {
          id: 1,
          title: "React Masterclass",
          price: 0,
          description: "Learn React from scratch.",
          CourseContent: [],
          Users: { first_name: "John", last_name: "Doe" },
          views: 0,
        },
      },
    })
    .mockResolvedValueOnce({ data: { data: [] } }); // /subscription/plans

  renderWithRoute(<CourseDetails />);

  expect(
    screen.getByText(/loading course details/i),
  ).toBeInTheDocument();

  const heading = await screen.findByRole("heading", {
    name: /react masterclass/i,
  });
  expect(heading).toBeInTheDocument();
});

test("shows 'Course not found' if API returns no course", async () => {
  api.get
    .mockResolvedValueOnce({
      data: { data: null }, // GET /courses/:id
    })
    .mockResolvedValueOnce({
      data: { data: [] }, // GET /subscription/plans
    });

  renderWithRoute(<CourseDetails />);

  expect(
    await screen.findByText(/course not found/i),
  ).toBeInTheDocument();
});

test("renders price and add to cart for paid course", async () => {
  api.get
    .mockResolvedValueOnce({
      data: {
        data: {
          id: 2,
          title: "Node.js Deep Dive",
          price: 49,
          description: "Advanced Node",
          CourseContent: [],
          Users: { first_name: "Jane", last_name: "Smith" },
          views: 10,
        },
      },
    })
    .mockResolvedValueOnce({ data: { data: [] } }); // /subscription/plans

  renderWithRoute(<CourseDetails />, { route: "/course/2" });

  const heading = await screen.findByRole("heading", {
    name: /node\.js deep dive/i,
  });
  expect(heading).toBeInTheDocument();

  expect(screen.getByText(/\$49\.00/)).toBeInTheDocument();
  expect(screen.getByText(/add to cart/i)).toBeInTheDocument();
});

test("free course renders a primary action button", async () => {
  api.get
    .mockResolvedValueOnce({
      data: {
        data: {
          id: 3,
          title: "Free HTML Basics",
          price: 0,
          description: "Intro HTML",
          CourseContent: [],
          Users: { first_name: "Alex", last_name: "Lee" },
          views: 5,
        },
      },
    })
    .mockResolvedValueOnce({ data: { data: [] } }); // /subscription/plans

  renderWithRoute(<CourseDetails />, { route: "/course/3" });

  const heading = await screen.findByRole("heading", {
    name: /free html basics/i,
  });
  expect(heading).toBeInTheDocument();

  // assert there is at least one button in the sidebar
  const buttons = screen.getAllByRole("button");
  expect(buttons.length).toBeGreaterThan(0);
});


test("clicking preview area opens preview modal if preview lesson exists", async () => {
  api.get
    .mockResolvedValueOnce({
      data: {
        data: {
          id: 4,
          title: "Preview Course",
          price: 10,
          description: "Has preview",
          CourseContent: [
            { id: 10, type: "section", title: "Section 1", order_index: 1 },
            {
              id: 11,
              type: "video",
              title: "Intro Preview",
              parent_id: 10,
              order_index: 1,
              is_preview: true,
              duration_seconds: 60,
            },
          ],
          Users: { first_name: "Sam", last_name: "Green" },
          views: 0,
        },
      },
    })
    .mockResolvedValueOnce({ data: { data: [] } });

  const user = userEvent.setup();

  renderWithRoute(<CourseDetails />, { route: "/course/4" });

  await screen.findByRole("heading", { name: /preview course/i });

  await user.click(screen.getByText(/preview this course/i));

  expect(screen.getByText(/preview modal/i)).toBeInTheDocument();
});
