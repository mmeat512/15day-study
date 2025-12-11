import { render, screen } from "@testing-library/react";
import DashboardPage from "../src/app/dashboard/page";
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

describe("DashboardPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("redirects to login if not authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(<DashboardPage />);
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("renders dashboard content with correct data if authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { username: "Test User" },
      loading: false,
    });

    render(<DashboardPage />);

    // Header
    expect(screen.getByText(/Welcome back, Test User/i)).toBeInTheDocument();

    // Study Overview Card
    expect(screen.getByText("January Stock Study")).toBeInTheDocument();
    expect(
      screen.getByText("Stock Investment for Beginners")
    ).toBeInTheDocument();
    expect(screen.getByText("33%")).toBeInTheDocument();
    expect(screen.getByText("Day 5 of 15")).toBeInTheDocument();

    // Today Assignment Card
    expect(screen.getByText("Today's Assignment")).toBeInTheDocument();
    expect(
      screen.getByText(/Day 5: Financial Statements Analysis/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Chapter 3")).toBeInTheDocument();
    expect(
      screen.getByText(/Understand the basics of Balance Sheet/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Start Assignment/i })
    ).toBeInTheDocument();

    // Stats Section
    expect(screen.getByText("Your Stats")).toBeInTheDocument();
    expect(screen.getByText("Total Submissions")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    });

    const { container } = render(<DashboardPage />);
    // Check for loader icon or loading state
    // Since ProtectedRoute returns null or loader, we can check if dashboard content is absent
    expect(screen.queryByText(/Welcome back/i)).not.toBeInTheDocument();
  });
});
