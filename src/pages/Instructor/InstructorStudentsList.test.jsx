import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import InstructorStudentsList from "./InstructorStudentsList";
import axios from "axios";

vi.mock("axios");

function renderWithRouter(initialEntry = "/instructor/courses/1/students") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/instructor/courses/:courseId/students"
          element={<InstructorStudentsList />}
        />
        <Route
          path="/instructor/courses/:courseId/students/:studentId/progress"
          element={<div>Student Progress Page</div>}
        />
        <Route path="/instructor/courses" element={<div>Courses Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

const mockCourse = { id: 1, title: "React Mastery" };

const mockStudents = [
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    enrolled_at: "2024-01-01T00:00:00Z",
    progress: 100,
    completed_lessons: 10,
    total_lessons: 10,
    quiz_average: 85,
    last_active: "2024-02-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Bob",
    email: "bob@example.com",
    enrolled_at: "2024-01-05T00:00:00Z",
    progress: 50,
    completed_lessons: 5,
    total_lessons: 10,
    quiz_average: 65,
    last_active: "2024-02-05T00:00:00Z",
  },
  {
    id: 3,
    name: "Charlie",
    email: "charlie@example.com",
    enrolled_at: "2024-01-10T00:00:00Z",
    progress: 0,
    completed_lessons: 0,
    total_lessons: 10,
    quiz_average: 40,
    last_active: "2024-02-10T00:00:00Z",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

test("shows loading spinner initially", () => {
  localStorage.setItem("accessToken", "token");

  axios.get.mockImplementation(() => new Promise(() => {}));

  renderWithRouter();

  expect(
    screen.getByText((content, element) =>
      element?.className.includes("animate-spin"),
    ),
  ).toBeInTheDocument();
});

test("renders course title, stats and students after load", async () => {
  localStorage.setItem("accessToken", "token");

  axios.get
    .mockResolvedValueOnce({ data: mockCourse })
    .mockResolvedValueOnce({ data: mockStudents });

  renderWithRouter();

  // course header
  expect(
    await screen.findByText(/react mastery/i),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/enrolled students/i),
  ).toBeInTheDocument();

  // at least one stat value appears (total students)
  expect(
    screen.getByText(/3 students enrolled in this course/i),
  ).toBeInTheDocument();

  // students present in table
  expect(screen.getByText(/alice@example.com/i)).toBeInTheDocument();
  expect(screen.getByText(/bob@example.com/i)).toBeInTheDocument();
  expect(screen.getByText(/charlie@example.com/i)).toBeInTheDocument();
});


test("filters students by search and progress", async () => {
  const user = userEvent.setup();
  localStorage.setItem("accessToken", "token");

  axios.get
    .mockResolvedValueOnce({ data: mockCourse })
    .mockResolvedValueOnce({ data: mockStudents });

  renderWithRouter();

  await screen.findByText(/react mastery/i);

  // search by name
  await user.type(
    screen.getByPlaceholderText(/search students by name or email/i),
    "alice",
  );

  expect(screen.getByText(/alice@example.com/i)).toBeInTheDocument();
  expect(screen.queryByText(/bob@example.com/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/charlie@example.com/i)).not.toBeInTheDocument();

  // clear search and filter by progress
  await user.clear(
    screen.getByPlaceholderText(/search students by name or email/i),
  );

  await user.selectOptions(
    screen.getByDisplayValue(/all progress/i),
    "completed",
  );
  expect(screen.getByText(/alice@example.com/i)).toBeInTheDocument();
  expect(screen.queryByText(/bob@example.com/i)).not.toBeInTheDocument();

  await user.selectOptions(
    screen.getByDisplayValue(/completed/i),
    "in-progress",
  );
  expect(screen.getByText(/bob@example.com/i)).toBeInTheDocument();
  expect(screen.queryByText(/alice@example.com/i)).not.toBeInTheDocument();

  await user.selectOptions(
    screen.getByDisplayValue(/in progress/i),
    "not-started",
  );
  expect(screen.getByText(/charlie@example.com/i)).toBeInTheDocument();
});

test("navigates to student progress page when clicking View Progress", async () => {
  const user = userEvent.setup();
  localStorage.setItem("accessToken", "token");

  axios.get
    .mockResolvedValueOnce({ data: mockCourse })
    .mockResolvedValueOnce({ data: mockStudents });

  renderWithRouter();

  await screen.findByText(/alice@example.com/i);

  await user.click(
    screen.getAllByRole("button", { name: /view progress/i })[0],
  );

  expect(await screen.findByText(/student progress page/i)).toBeInTheDocument();
});
