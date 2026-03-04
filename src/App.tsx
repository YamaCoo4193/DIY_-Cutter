import { useEffect, useState } from 'react';
import { MaterialEstimatePage } from './pages/MaterialEstimatePage';
import { HowToPage } from './pages/HowToPage';

const HOW_TO_HASH = '#/how-to';

const readRoute = (): 'workspace' | 'how-to' => (window.location.hash === HOW_TO_HASH ? 'how-to' : 'workspace');

const App = (): JSX.Element => {
  const [route, setRoute] = useState<'workspace' | 'how-to'>(() => readRoute());

  useEffect(() => {
    const handleHashChange = (): void => {
      setRoute(readRoute());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return route === 'how-to' ? <HowToPage /> : <MaterialEstimatePage />;
};

export default App;
