import { Effect, FiberHandle, Scope } from "effect";
import { useComponentScope } from "./use-component-scope.js";
import { useState } from "react";

export function useRunEffectLatest<Args extends any[], A, E>(
  fn: (...args: Args) => Effect.Effect<A, E, never>,
) {
  const [fiberHandle, setFiberHandle] =
    useState<FiberHandle.FiberHandle | null>(null);

  useComponentScope((scope) => {
    const fiberHandle = Effect.runSync(
      FiberHandle.make().pipe(Scope.extend(scope)),
    );
    setFiberHandle(fiberHandle);
  });

  return (...args: Args) => {
    if (!fiberHandle) {
      return console.error(
        "useRunEffectLatest: No scope available, effect will not run.",
      );
    }

    return Effect.runPromiseExit(FiberHandle.run(fiberHandle, fn(...args)));
  };
}
