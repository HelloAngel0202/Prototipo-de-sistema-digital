import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';

function App() {

  const [user, setUser] = useState({ name: "JC Castillo", role: "cliente" });
  // const [user, setUser] = useState(null);

  return (
    <div className="App">

      <Navbar user={user} />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
        <Route path='/register' element={user ? <Navigate to="/dashboard" /> : <Register setUser={setUser} />} />

        <Route  path='/dashboard' element={
          user ? (
            <div style={{ padding: '2rem' }}>
              <h1>Panel de {user.role === 'cliente' ? 'Préstamos' : 'Inversiones'}</h1>
              <p>Bienvenido, {user.name}. Aquí verás tu información privada.</p>
            </div>
          ) : (
            <Navigate to="/login" />
          )
        }
        />
      </Routes>

    </div>
  );
}

export default App;