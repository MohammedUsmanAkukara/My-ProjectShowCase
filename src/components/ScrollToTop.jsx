import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Jab bhi URL path (page) change hoga, ye page ko ekdum top par scroll kar dega
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Ye screen par kuch render nahi karega, background me kaam karega
};

export default ScrollToTop;