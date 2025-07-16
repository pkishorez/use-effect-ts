import { Effect, FiberSet, Scope } from "effect";
import { useComponentScope } from "./use-component-scope.js";
import { useState } from "react";

export function useRunEffect<Args extends any[], A, E>(
  fn: (...args: Args) => Effect.Effect<A, E, never>,
) {
  const [fiberSet, setFiberSet] = useState<FiberSet.FiberSet | null>(null);
  useComponentScope((scope) => {
    const fiberSet = Effect.runSync(FiberSet.make().pipe(Scope.extend(scope)));
    setFiberSet(fiberSet);
  });

  return (...args: Args) => {
    if (!fiberSet) {
      throw new Error(
        "useRunEffect: No scope available, effect will not run. Consider using useComponentLifecycle to call initial run.",
      );
    }

    return Effect.runPromiseExit(FiberSet.run(fiberSet, fn(...args)));
  };
}
