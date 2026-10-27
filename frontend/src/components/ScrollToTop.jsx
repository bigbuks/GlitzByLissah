import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // ✅ Force the browser to NOT remember the previous scroll position
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // ✅ Scroll to top instantly
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // 'instant' is better than 'smooth' for page changes
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;