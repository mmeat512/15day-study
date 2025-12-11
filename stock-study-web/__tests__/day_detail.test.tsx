import { render, screen, fireEvent } from "@testing-library/react";
import DayDetailPage from "../src/app/studies/[studyId]/day/[dayNumber]/page";
import { useAuth } from "../src/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";

// Mock Auth Context
jest.mock("../src/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js router and params
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

describe("DayDetailPage", () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
    (useParams as jest.Mock).mockReturnValue({ studyId: "1", dayNumber: "5" });
  });

  it("renders day detail content if authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { username: "Test User" },
      loading: false,
    });

    render(<DayDetailPage />);

    // Header
    expect(screen.getByText(/Day 5 \/ 15/i)).toBeInTheDocument();
    expect(
      screen.getByText("Financial Statements Analysis")
    ).toBeInTheDocument();

    // Learning Goal
    expect(
      screen.getByText(/Understand the basics of Balance Sheet/i)
    ).toBeInTheDocument();

    // Assignments
    expect(
      screen.getByText(/What are the three main financial statements/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Explain the difference between Net Income/i)
    ).toBeInTheDocument();

    // Reflection
    expect(screen.getByText(/What did you learn today/i)).toBeInTheDocument();

    // Buttons
    expect(screen.getByText(/Submit Assignment/i)).toBeInTheDocument();
  });

  it("allows entering answers", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { username: "Test User" },
      loading: false,
    });

    render(<DayDetailPage />);

    const textareas = screen.getAllByPlaceholderText(/Write your answer here/i);
    fireEvent.change(textareas[0], {
      target: { value: "Balance Sheet, Income Statement, Cash Flow" },
    });

    expect(textareas[0]).toHaveValue(
      "Balance Sheet, Income Statement, Cash Flow"
    );
  });
});
