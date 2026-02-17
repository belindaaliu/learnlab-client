import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from "./Login";
import axios from "axios";

vi.mock("axios");

function renderWithRouter(initialRoute = "/login") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/student/dashboard" element={<div>Student Dashboard</div>} />
        <Route path="/instructor/dashboard" element={<div>Instructor Dashboard</div>} />
        <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
        <Route path="/mfa-verify" element={<div>MFA Verify Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

test("renders login form fields", () => {
  renderWithRouter();

  expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /sign in/i }),
  ).toBeInTheDocument();
});

test("successful login without MFA stores tokens and redirects by role", async () => {
  const user = userEvent.setup();

  axios.post.mockResolvedValueOnce({
    data: {
      mfaRequired: false,
      data: {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: 1, role: "student" },
      },
    },
  });

  renderWithRouter();

  await user.type(screen.getByLabelText(/email address/i), "john@example.com");
  await user.type(screen.getByLabelText(/^password$/i), "password123");
  await user.click(screen.getByRole("button", { name: /sign in/i }));

  expect(localStorage.getItem("accessToken")).toBe("access-token");
  expect(localStorage.getItem("refreshToken")).toBe("refresh-token");

  expect(
    await screen.findByText(/student dashboard/i),
  ).toBeInTheDocument();
});

test("login with MFA required stores temp data and redirects to mfa-verify", async () => {
  const user = userEvent.setup();

  axios.post.mockResolvedValueOnce({
    data: {
      mfaRequired: true,
      tempToken: "temp-token",
      userId: 42,
      email: "mfa@example.com",
      mfaMethods: ["totp", "email"],
    },
  });

  renderWithRouter();

  await user.type(screen.getByLabelText(/email address/i), "mfa@example.com");
  await user.type(screen.getByLabelText(/^password$/i), "password123");
  await user.click(screen.getByRole("button", { name: /sign in/i }));

  expect(sessionStorage.getItem("mfaTempToken")).toBe("temp-token");
  expect(sessionStorage.getItem("mfaUserId")).toBe("42");
  expect(sessionStorage.getItem("mfaEmail")).toBe("mfa@example.com");
  expect(sessionStorage.getItem("mfaMethods")).toContain("totp");

  expect(
    await screen.findByText(/mfa verify page/i),
  ).toBeInTheDocument();
});

test("shows server error message on failed login", async () => {
  const user = userEvent.setup();

  axios.post.mockRejectedValueOnce({
    response: { data: { message: "Invalid credentials" } },
  });

  renderWithRouter();

  await user.type(screen.getByLabelText(/email address/i), "john@example.com");
  await user.type(screen.getByLabelText(/^password$/i), "wrongpass");
  await user.click(screen.getByRole("button", { name: /sign in/i }));

  expect(
    await screen.findByText(/invalid credentials/i),
  ).toBeInTheDocument();
});
