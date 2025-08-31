import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>جاري التحقق...</p>;

  return (
    <div className="App">
      {user ? <Dashboard /> : <Login onLogin={() => {}} />}
    </div>
  );
}

export default App;