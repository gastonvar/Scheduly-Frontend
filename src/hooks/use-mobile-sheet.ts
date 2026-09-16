import { useEffect, useState } from 'react';

export function useMobileSheet() {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 639px)').matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const sync = () => setMatches(media.matches);

    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return matches;
}
