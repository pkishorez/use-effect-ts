import { Effect, Fiber, Scope } from "effect";
import { useEffect } from "react";
import { useLiveRef } from "./use-live-ref.js";

export function useComponentLifecycle(
  effect: Effect.Effect<unknown, unknown, Scope.Scope>,
  {
    deps = [],
  }: {
    deps?: unknown[];
  } = {},
) {
  const effectRef = useLiveRef(effect);

  useEffect(() => {
    const scope = Effect.runSync(Scope.make());
    const fiber = Effect.runFork(effectRef.current.pipe(Scope.extend(scope)));

    return () => {
      Effect.runFork(
        Effect.gen(function* () {
          const exit = yield* Fiber.interrupt(fiber);
          yield* Scope.close(scope, exit);
        }),
      );
      void Effect.runPromise(Fiber.interrupt(fiber));
    };
  }, [effectRef, ...deps]);
}
