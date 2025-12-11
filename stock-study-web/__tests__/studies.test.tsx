import { render, screen } from "@testing-library/react";
import StudyListPage from "../src/app/studies/page";
import { useAuth } from "../src/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Mock Auth Context
jest.mock("../src/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("StudyListPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders study list content if authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { username: "Test User" },
      loading: false,
    });

    render(<StudyListPage />);
    expect(screen.getByText(/My Studies/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Study/i)).toBeInTheDocument();
    expect(screen.getByText(/Join Study/i)).toBeInTheDocument();

    // Check for mock data rendering
    expect(screen.getByText(/January Stock Study/i)).toBeInTheDocument();
    expect(screen.getByText(/Advanced Chart Analysis/i)).toBeInTheDocument();
  });
});
