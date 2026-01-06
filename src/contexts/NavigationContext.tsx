'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState
} from 'react';

interface NavigationContextType {
  isNavigating: boolean;
  startNavigation: () => void;
  push: (...args: Parameters<ReturnType<typeof useRouter>['push']>) => void;
  replace: (...args: Parameters<ReturnType<typeof useRouter>['replace']>) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigating: false,
  startNavigation: () => {},
  push: () => {},
  replace: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Reset navigation state when the path or search params change
  useEffect(() => {
    // Add a small delay to ensure the transition completes
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Function to manually start navigation
  const startNavigation = () => {
    setIsNavigating(true);
  };

  // Wrapper for router.push that triggers navigation state
  const push = (...args: Parameters<typeof router.push>) => {
    setIsNavigating(true);
    return router.push(...args);
  };

  // Wrapper for router.replace that triggers navigation state
  const replace = (...args: Parameters<typeof router.replace>) => {
    setIsNavigating(true);
    return router.replace(...args);
  };

  // Attach event listeners for navigation
  useEffect(() => {
    // For browser navigation events
    const handleBeforeUnload = () => {
      setIsNavigating(true);
    };
    
    // For client-side navigation using Next.js links
    const handleLinkClick = (e: MouseEvent) => {
      // Check if it's a navigation link
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && 
          link.href && 
          !link.target && 
          !link.download && 
          !link.rel?.includes('external') &&
          link.href.indexOf(window.location.origin) === 0 && // Same origin
          !e.ctrlKey && !e.metaKey && !e.shiftKey) { // Not opening in new tab
        setIsNavigating(true);
      }
    };

    // For browser back/forward buttons
    const handlePopState = () => {
      setIsNavigating(true);
    };
    
    document.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleLinkClick);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      document.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleLinkClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation, push, replace }}>
      {children}
    </NavigationContext.Provider>
  );
} 