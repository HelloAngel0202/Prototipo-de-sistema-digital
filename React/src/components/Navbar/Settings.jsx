import "./css/Settings.css";
import { useState } from "react";


function Settings({ user }) {
  const [language, setLanguage] = useState("es");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    // Aquí enviarías los cambios al backend
    console.log({ language, theme, notifications });
  };

  return (
    <div className="settings-container">
      <h2>Configuraciones</h2>

      <div className="setting-item">
        <label>Idioma:</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="es">Español</option>
          <option value="en">Inglés</option>
        </select>
      </div>

      <div className="setting-item">
        <label>Tema:</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
        </select>
      </div>

      <div className="setting-item">
        <label>Notificaciones:</label>
        <input
          type="checkbox"
          checked={notifications}
          onChange={(e) => setNotifications(e.target.checked)}
        />
      </div>

      <button onClick={handleSave}>Guardar cambios</button>
    </div>
  );
}

export default Settings;
