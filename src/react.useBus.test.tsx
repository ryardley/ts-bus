import { renderHook } from "@testing-library/react-hooks";
import { useBus } from "./react";
import { bus, wrapper } from "./testhelpers";

it("should provide a bus", () => {
  const { result } = renderHook(() => useBus(), { wrapper });
  expect(result.current).toBe(bus);
});
