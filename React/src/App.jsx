import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';

function App() {
  return (
    <div className="App">

      <Navbar />
      <Routes>
        <Route path='/' element={
          <main>
            <h2>Sistema gestor de prestamos</h2>
          </main>
        }
        />
        <Route path='/login' element={<Login />}/>
        <Route path='/register' element={<Register />}/>
      </Routes>

    </div>
  );
}

export default App;