import { render, screen } from "@testing-library/react";
import Page from "../src/app/page";

describe("Home", () => {
  it("renders a heading", () => {
    render(<Page />);

    expect(
      screen.getByText(/To get started, edit the page.tsx file/i)
    ).toBeInTheDocument();
  });
});
