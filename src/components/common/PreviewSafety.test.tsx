import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PreviewForm } from "./PreviewForm";
import { PublicPreviewHome } from "./PublicPreviewHome";
import { PublicPreviewNav } from "./PublicPreviewNav";
import { FeaturePreviewBoundary } from "./FeaturePreview";
import Contact from "@/pages/Contact";
import { SiteNav } from "@/components/site/SiteNav";

const { databaseCall, authCall } = vi.hoisted(() => ({
  databaseCall: vi.fn(() => { throw new Error("Public preview must not query the database"); }),
  authCall: vi.fn(() => { throw new Error("Hidden navigation must not load an account"); }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: databaseCall, auth: { getSession: authCall, onAuthStateChange: authCall } },
}));

afterEach(() => {
  cleanup();
  expect(databaseCall).not.toHaveBeenCalled();
  expect(authCall).not.toHaveBeenCalled();
  vi.clearAllMocks();
});

describe("public preview safety", () => {
  it("disables fields and cancels a programmatic submission", () => {
    const { container } = render(<PreviewForm><label htmlFor="sample">Name</label><input id="sample" /><button>Submit</button></PreviewForm>);
    expect(screen.getByLabelText("Name")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
    expect(fireEvent.submit(container.querySelector("form")!)).toBe(false);
  });

  it("keeps enquiry, newsletter and waitlist forms non-operational", () => {
    const { container } = render(<MemoryRouter><Contact /></MemoryRouter>);
    expect(screen.getByLabelText("Message")).toBeDisabled();
    expect(screen.getByLabelText("Newsletter email")).toBeDisabled();
    expect(screen.getByLabelText("App updates email")).toBeDisabled();
    for (const form of container.querySelectorAll("form")) expect(fireEvent.submit(form)).toBe(false);
    expect(screen.queryByText(/we'll get back to you within 24 hours/i)).not.toBeInTheDocument();
  });

  it("renders the informational home without a live booking or delivery checker", () => {
    render(<MemoryRouter><PublicPreviewHome /></MemoryRouter>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Welcome to Ayuzee");
    expect(screen.getByText(/services are not available yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /book|check delivery|add to cart/i })).not.toBeInTheDocument();
  });

  it("does not initialize account hooks for hidden legacy navigation", () => {
    const { container } = render(<MemoryRouter><SiteNav /></MemoryRouter>);
    expect(container).toBeEmptyDOMElement();
  });

  it("lets users follow public navigation while blocking an account route", () => {
    render(<MemoryRouter initialEntries={["/"]}><FeaturePreviewBoundary><PublicPreviewNav /><Routes><Route path="/" element={<a href="/auth">Account</a>} /><Route path="/about-us" element={<h1>About page</h1>} /></Routes></FeaturePreviewBoundary></MemoryRouter>);
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "About" }));
    expect(screen.getByRole("heading", { name: "About page" })).toBeInTheDocument();
    cleanup();
    render(<MemoryRouter initialEntries={["/auth"]}><FeaturePreviewBoundary><p>Account form must not mount</p></FeaturePreviewBoundary></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Account access" })).toHaveFocus();
    expect(screen.queryByText("Account form must not mount")).not.toBeInTheDocument();
  });
});
