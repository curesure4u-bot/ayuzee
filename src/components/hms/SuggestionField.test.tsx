import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";


const suggestions = [
  { id: "s1", suggestion_text: "Back pain", short_code: "bkp", suggestion_type: "chief_complaint", usage_count: 10 },
  { id: "s2", suggestion_text: "Headache", short_code: "hd", suggestion_type: "chief_complaint", usage_count: 5 },
  { id: "s3", suggestion_text: "Fever", short_code: "fv", suggestion_type: "chief_complaint", usage_count: 2 },
];

vi.mock("@/integrations/supabase/client", () => {
  const builder: any = {};
  ["select", "eq", "order", "limit"].forEach((k) => (builder[k] = vi.fn().mockReturnValue(builder)));
  builder.then = (resolve: any) => Promise.resolve({ data: suggestions }).then(resolve);
  return {
    supabase: {
      from: vi.fn(() => builder),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  };
});

import { supabase } from "@/integrations/supabase/client";
const rpcMock = supabase.rpc as unknown as ReturnType<typeof vi.fn>;

// Import AFTER mock
import SuggestionField, { invalidateSuggestionCache } from "@/components/hms/SuggestionField";

const flushAsync = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

const Harness = ({ initial = "", onChange }: { initial?: string; onChange?: (v: string) => void }) => {
  const [v, setV] = (require("react") as typeof import("react")).useState(initial);
  return (
    <SuggestionField
      type="chief_complaint"
      value={v}
      onChange={(nv) => {
        setV(nv);
        onChange?.(nv);
      }}
      placeholder="cc"
    />
  );
};

describe("SuggestionField", () => {
  beforeEach(() => {
    rpcMock.mockClear();
    invalidateSuggestionCache();
  });

  it("opens dropdown on focus and lists suggestions from the master", async () => {
    render(<Harness />);
    await flushAsync();
    const input = screen.getByPlaceholderText("cc");
    fireEvent.focus(input);
    await waitFor(() => expect(screen.getByText("Back pain")).toBeInTheDocument());
    expect(screen.getByText("Headache")).toBeInTheDocument();
    expect(screen.getByText("Fever")).toBeInTheDocument();
  });

  it("filters by short_code and full text", async () => {
    render(<Harness />);
    await flushAsync();
    const input = screen.getByPlaceholderText("cc") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "head" } });
    await waitFor(() => expect(screen.getByText("Headache")).toBeInTheDocument());
    expect(screen.queryByText("Back pain")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "bkp" } });
    await waitFor(() => expect(screen.getByText("Back pain")).toBeInTheDocument());
  });

  it("selects with ArrowDown + Enter, replaces value and bumps usage_count", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await flushAsync();
    const input = screen.getByPlaceholderText("cc") as HTMLInputElement;
    fireEvent.focus(input);
    await waitFor(() => screen.getByText("Back pain"));

    fireEvent.keyDown(input, { key: "ArrowDown" }); // active = 1 (Headache)
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("Headache"));
    expect(rpcMock).toHaveBeenCalledWith("hms_increment_suggestion_usage", { _id: "s2" });
  });

  it("Tab inserts the highlighted suggestion", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await flushAsync();
    const input = screen.getByPlaceholderText("cc") as HTMLInputElement;
    fireEvent.focus(input);
    await waitFor(() => screen.getByText("Back pain"));
    fireEvent.keyDown(input, { key: "Tab" }); // first item

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("Back pain"));
    expect(rpcMock).toHaveBeenCalledWith("hms_increment_suggestion_usage", { _id: "s1" });
  });

  it("clicking an option inserts it and bumps usage_count", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await flushAsync();
    const input = screen.getByPlaceholderText("cc");
    fireEvent.focus(input);
    const option = await screen.findByText("Fever");
    fireEvent.mouseDown(option);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("Fever"));
    expect(rpcMock).toHaveBeenCalledWith("hms_increment_suggestion_usage", { _id: "s3" });
  });

  it("expands short_code on space (bkp + space → 'Back pain ')", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await flushAsync();
    const input = screen.getByPlaceholderText("cc") as HTMLInputElement;
    fireEvent.focus(input);
    await waitFor(() => screen.getByText("Back pain"));

    fireEvent.change(input, { target: { value: "bkp " } });

    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith("Back pain "),
    );
    expect(rpcMock).toHaveBeenCalledWith("hms_increment_suggestion_usage", { _id: "s1" });
  });

  it("does not expand an unknown short code", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await flushAsync();
    const input = screen.getByPlaceholderText("cc") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "zzz " } });
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("zzz "));
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("Escape closes the dropdown", async () => {
    render(<Harness />);
    await flushAsync();
    const input = screen.getByPlaceholderText("cc");
    fireEvent.focus(input);
    await waitFor(() => screen.getByText("Back pain"));
    fireEvent.keyDown(input, { key: "Escape" });
    await waitFor(() => expect(screen.queryByText("Back pain")).not.toBeInTheDocument());
  });
});
