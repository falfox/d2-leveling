import { useCallback, useEffect, useState } from "react";

export function useKeyPress(
  targetKey: string,
  callback: (...params: any) => void
) {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState(false);
  const triggerCallback = useCallback(() => {
    callback();
  }, []);

  // If pressed key is our target key then set to true
  function downHandler({ key }: KeyboardEvent) {
    if (key === targetKey) {
      triggerCallback();
    }
  }

  // If released key is our target key then set to false
  const upHandler = ({ key }: KeyboardEvent) => {
    if (key === targetKey) {
      triggerCallback();
    }
  };

  // Add event listeners
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return keyPressed;
}
