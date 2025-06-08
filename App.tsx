import React, { useEffect } from 'react';
import Navigation from './src/navigation/Navigation';
import { initDatabase } from './src/services/db';

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return <Navigation />;
}
