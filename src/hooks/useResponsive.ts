import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = { tablet: 768, desktop: 1024 } as const;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;
  return {
    width,
    height,
    isMobile: !isTablet,
    isTablet: isTablet && !isDesktop,
    isDesktop,
    columns: isDesktop ? 4 : isTablet ? 2 : 1,
  };
}
