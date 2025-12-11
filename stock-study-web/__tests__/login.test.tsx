import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../src/app/login/page";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getDocs } from "firebase/firestore";

// Mock Firebase Auth
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

jest.mock("../src/lib/firebase", () => ({
  auth: {},
  db: {},
}));

// Mock Firestore
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("LoginPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (signInWithEmailAndPassword as jest.Mock).mockClear();
    (getDocs as jest.Mock).mockClear();
  });

  it("renders login form", () => {
    render(<LoginPage />);
    expect(
      screen.getByPlaceholderText("Email or Username")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("handles successful login with username", async () => {
    // Mock Firestore query response
    (getDocs as jest.Mock).mockResolvedValueOnce({
      empty: false,
      docs: [{ data: () => ({ email: "test@example.com" }) }],
    });
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({});

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Email or Username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(getDocs).toHaveBeenCalled();
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "test@example.com",
        "password123"
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles successful login with email", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({});

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Email or Username"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      // Should NOT call Firestore for email login
      expect(getDocs).not.toHaveBeenCalled();
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "test@example.com",
        "password123"
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles user not found (username)", async () => {
    // Mock Firestore query response (empty)
    (getDocs as jest.Mock).mockResolvedValueOnce({
      empty: true,
      docs: [],
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Email or Username"), {
      target: { value: "nonexistent" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/User not found. Please check your username./i)
      ).toBeInTheDocument();
    });
  });

  it("handles wrong password", async () => {
    // Mock Firestore query response
    (getDocs as jest.Mock).mockResolvedValueOnce({
      empty: false,
      docs: [{ data: () => ({ email: "test@example.com" }) }],
    });
    const error = new Error("Invalid credentials");
    (error as any).code = "auth/wrong-password";
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(error);

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Email or Username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid password/i)).toBeInTheDocument();
    });
  });
});
