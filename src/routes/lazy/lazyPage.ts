import { lazy, type ComponentType } from "react";

export const lazyPage = <T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) => lazy(factory);
