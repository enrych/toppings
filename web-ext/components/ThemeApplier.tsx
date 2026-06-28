import React from "react";
import { useTheme } from "../core/useTheme";

export default function ThemeApplier({
  children,
}: {
  children: React.ReactNode;
}) {
  useTheme();
  return <>{children}</>;
}
