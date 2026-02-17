import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CoursePlayer from "./CoursePlayer";
import axios from "axios";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// helper: render with /course/:courseId/learn route
function renderWithRouter(initialEntry = "/course/1/learn") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/course/:courseId/learn" element={<CoursePlayer />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

test("redirects to login when no user in localStorage", () => {
  delete window.location;
  window.location = { href: "" };

  renderWithRouter();

  expect(window.location.href).toBe("/login");
});

test("shows loading state while fetching course", () => {
  localStorage.setItem("user", JSON.stringify({ id: 1 }));
  localStorage.setItem("accessToken", "token");

  axios.get.mockResolvedValue({ data: {} });

  renderWithRouter();

  expect(screen.getByText(/loading course/i)).toBeInTheDocument();
});

test("renders course title and content when data is loaded", async () => {
  localStorage.setItem("user", JSON.stringify({ id: 1 }));
  localStorage.setItem("accessToken", "token");

  axios.get
    .mockResolvedValueOnce({ data: { data: [] } })
    .mockResolvedValueOnce({
      data: {
        title: "React Course",
        description: "Learn React",
        rating: 4.5,
        reviews: 0,
        students: 100,
        updated_at: "2024-01-01T00:00:00Z",
        completed_lessons: 0,
        total_lessons: 1,
        image: "",
        instructor: {
          name: "John Doe",
          headline: "Instructor",
          biography: "Bio",
          photo: "",
        },
      },
    })
    .mockResolvedValueOnce({
      data: [
        {
          id: "section-1",
          type: "section",
          title: "Section 1",
          children: [
            {
              id: 10,
              type: "video",
              title: "Intro Video",
              duration_seconds: 60,
              video_url: "http://example.com/video.mp4",
            },
          ],
        },
      ],
    })
    .mockResolvedValueOnce({
      data: { completedLessonIds: [] },
    })
    .mockResolvedValueOnce({
      data: {
        id: 10,
        type: "video",
        title: "Intro Video",
        duration_seconds: 60,
        video_url: "http://example.com/video.mp4",
      },
    });

  renderWithRouter();

  const heading = await screen.findByRole("heading", {
    name: /react course/i,
    level: 1,
  });
  expect(heading).toBeInTheDocument();

  // at least one "Intro Video" appears (sidebar + footer both render it)
  const introNodes = screen.getAllByText(/intro video/i);
  expect(introNodes.length).toBeGreaterThan(0);

  expect(screen.getByText(/learn react/i)).toBeInTheDocument();
});
