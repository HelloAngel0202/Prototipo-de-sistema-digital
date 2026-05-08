import Navbar from './components/Navbar/Navbar';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <h2>Sistema gestor de prestamos</h2>
      </main>
      <Register />
    </div>
  );
}

export default App;