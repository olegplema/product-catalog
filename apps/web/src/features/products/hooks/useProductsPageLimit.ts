import { useEffect, useState } from 'react';

const MOBILE_PRODUCTS_LIMIT = 9;
const TABLET_PRODUCTS_LIMIT = 10;
const DESKTOP_PRODUCTS_LIMIT = 12;

function getProductsPageLimit(): number {
  if (typeof window === 'undefined') {
    return DESKTOP_PRODUCTS_LIMIT;
  }

  if (window.innerWidth < 768) {
    return MOBILE_PRODUCTS_LIMIT;
  }

  if (window.innerWidth < 1200) {
    return TABLET_PRODUCTS_LIMIT;
  }

  return DESKTOP_PRODUCTS_LIMIT;
}

export function useProductsPageLimit(): number {
  const [limit, setLimit] = useState(getProductsPageLimit);

  useEffect(() => {
    const handleResize = () => {
      const nextLimit = getProductsPageLimit();

      setLimit((currentLimit) => (currentLimit === nextLimit ? currentLimit : nextLimit));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return limit;
}
