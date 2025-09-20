import { useEffect, useState } from 'react';
import { getStoredTheme, setTheme, listenToSystemTheme, resolveTheme } from './theme';

export function useTheme() {
  const [choice, setChoice] = useState(getStoredTheme());       // 'light' | 'dark' | 'system'
  const [effective, setEffective] = useState(resolveTheme(choice)); // actual applied theme

  useEffect(() => {
    // apply on mount and when user changes "choice"
    setTheme(choice);
    setEffective(resolveTheme(choice));
  }, [choice]);

  useEffect(() => {
    // if user chose 'system', react to OS changes
    if (choice !== 'system') return;
    const unlisten = listenToSystemTheme((sys) => setEffective(sys));
    return unlisten;
  }, [choice]);

  return {
    choice,                     // user setting
    effective,                  // actual applied theme
    setChoice,                  // set 'light' | 'dark' | 'system'
    toggle: () => {
      // 👇 flip based on the current effective theme
      setChoice(prev =>
        resolveTheme(prev) === 'dark' ? 'light' : 'dark'
      );
    },
  };
}
