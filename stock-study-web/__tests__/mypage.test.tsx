import { render, screen, fireEvent } from "@testing-library/react";
import MyPage from "../src/app/mypage/page";
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

// Mock Firebase auth
jest.mock("../src/lib/firebase", () => ({
  auth: {
    signOut: jest.fn(),
  },
}));

describe("MyPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders profile and stats if authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        username: "Test User",
        email: "test@example.com",
        createdAt: new Date("2025-01-01"),
      },
      loading: false,
    });

    render(<MyPage />);

    // Profile
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText(/Member since/i)).toBeInTheDocument();

    // Stats
    expect(screen.getByText("Total Studies")).toBeInTheDocument();
    expect(screen.getByText("Completed Studies")).toBeInTheDocument();
    expect(screen.getByText("Assignments Done")).toBeInTheDocument();

    // Logout Button
    expect(screen.getByText(/Log Out/i)).toBeInTheDocument();
  });

  it("handles logout", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { username: "Test User", createdAt: new Date() },
      loading: false,
    });

    render(<MyPage />);

    const logoutBtn = screen.getByText(/Log Out/i);
    fireEvent.click(logoutBtn);

    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
