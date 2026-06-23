import React from "react";
import { useTheme } from "../hooks/useTheme";

export default function ThemeApplier({
  children,
}: {
  children: React.ReactNode;
}) {
  useTheme();
  return <>{children}</>;
}
