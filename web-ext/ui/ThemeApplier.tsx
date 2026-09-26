import React from "react";
import { useTheme } from "./useTheme";

export default function ThemeApplier({
  children,
}: {
  children: React.ReactNode;
}) {
  useTheme();
  return <>{children}</>;
}
