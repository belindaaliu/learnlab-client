import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Register from "./Register";
import axios from "axios";

vi.mock("axios");

//  navigation
function renderWithRouter(initialRoute = "/register") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/student/dashboard" element={<div>Student Dashboard</div>} />
        <Route path="/instructor/dashboard" element={<div>Instructor Dashboard</div>} />
        <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

test("renders register form fields", () => {
  renderWithRouter();

  expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/i am a/i)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /create account/i }),
  ).toBeInTheDocument();
});

test("successful registration stores tokens and redirects student", async () => {
  const user = userEvent.setup();

  axios.post.mockResolvedValueOnce({
    data: {
      data: {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: 1, role: "student" },
      },
    },
  });

  renderWithRouter();

  await user.type(screen.getByLabelText(/first name/i), "John");
  await user.type(screen.getByLabelText(/last name/i), "Doe");
  await user.type(screen.getByLabelText(/email address/i), "john@example.com");
  await user.type(screen.getByLabelText(/^password$/i), "password123");
  await user.type(screen.getByLabelText(/confirm password/i), "password123");
  await user.click(screen.getByRole("button", { name: /create account/i }));

  // tokens stored
  expect(localStorage.getItem("accessToken")).toBe("access-token");
  expect(localStorage.getItem("refreshToken")).toBe("refresh-token");

  // redirected to student dashboard
  expect(
    await screen.findByText(/student dashboard/i),
  ).toBeInTheDocument();
});

test("shows server error message on failed registration", async () => {
  const user = userEvent.setup();

  axios.post.mockRejectedValueOnce({
    response: { data: { message: "Email already exists" } },
  });

  renderWithRouter();

  await user.type(screen.getByLabelText(/first name/i), "John");
  await user.type(screen.getByLabelText(/last name/i), "Doe");
  await user.type(screen.getByLabelText(/email address/i), "john@example.com");
  await user.type(screen.getByLabelText(/^password$/i), "password123");
  await user.type(screen.getByLabelText(/confirm password/i), "password123");
  await user.click(screen.getByRole("button", { name: /create account/i }));

  expect(
    await screen.findByText(/email already exists/i),
  ).toBeInTheDocument();
});
