// useUser.js
import { useState, useEffect } from 'react';

export function useUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    // TODO: fetch or subscribe to user profile
  }, []);
  return { user, setUser };
}
