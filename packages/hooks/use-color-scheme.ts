import { useThemeContext } from "@/packages/lib/theme-provider";

export function useColorScheme() {
  return useThemeContext().colorScheme;
}
