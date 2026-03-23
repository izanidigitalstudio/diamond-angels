import React, { createContext, useContext, useState, useCallback } from 'react';

interface DemoContextType {
  isDemo: boolean;
  demoRole: string;
  enterDemo: () => void;
  exitDemo: () => void;
  setDemoRole: (role: string) => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemo: false,
  demoRole: '',
  enterDemo: () => {},
  exitDemo: () => {},
  setDemoRole: () => {},
});

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemo, setIsDemo] = useState(false);
  const [demoRole, setDemoRole] = useState('');

  const enterDemo = useCallback(() => setIsDemo(true), []);
  const exitDemo = useCallback(() => {
    setIsDemo(false);
    setDemoRole('');
  }, []);

  return (
    <DemoContext.Provider value={{ isDemo, demoRole, enterDemo, exitDemo, setDemoRole }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = () => useContext(DemoContext);
