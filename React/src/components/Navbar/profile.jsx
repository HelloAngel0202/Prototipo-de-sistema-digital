import "./css/Profile.css";
import { useState } from "react";
import axios from "axios";

function Profile({ user }) {
  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    phone: user.phone || "",
    nationality: user.nationality || "",
    document: user.document || "",
    document_type: user.document_type || "",
    address: user.address || "",
    user_type: user.user_type || "",
    birth_date: user.birth_date || "",
    Estado_civil: user.Estado_civil || "",
    occupation: user.occupation || "",
    city: user.city || "",
    username: user.username || "",
    photo: user.photo || ""
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    await axios.put("/api/users/update", data, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  };

  return (
    <div className="profile-container">
      <h2>Editar Perfil</h2>

      <form className="profile-form" onSubmit={handleSubmit}>
        
        <label>Nombre</label>
        <input
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
        />

        <label>Apellido</label>
        <input
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
        />

        <label>Correo electrónico</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <label>Teléfono</label>
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />

        <label>Nacionalidad</label>
        <input
          name="nationality"
          value={formData.nationality}
          onChange={handleChange}
        />

        <label>Documento</label>
        <input
          name="document"
          value={formData.document}
          onChange={handleChange}
        />

        <label>Tipo de documento</label>
        <input
          name="document_type"
          value={formData.document_type}
          onChange={handleChange}
        />

        <label>Dirección</label>
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
        />

        <label>Tipo de usuario</label>
        <input
          name="user_type"
          value={formData.user_type}
          onChange={handleChange}
        />

        <label>Fecha de nacimiento</label>
        <input
          type="date"
          name="birth_date"
          value={formData.birth_date}
          onChange={handleChange}
        />

        <label>Estado civil</label>
        <input
          name="Estado_civil"
          value={formData.Estado_civil}
          onChange={handleChange}
        />

        <label>Ocupación</label>
        <input
          name="occupation"
          value={formData.occupation}
          onChange={handleChange}
        />

        <label>Ciudad</label>
        <input
          name="city"
          value={formData.city}
          onChange={handleChange}
        />

        <label>Nombre de usuario</label>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
        />

        <label>Foto de perfil</label>
        <input
          type="file"
          name="photo"
          onChange={handleChange}
        />

        <button type="submit">Guardar cambios</button>
      </form>
    </div>
  );
}

export default Profile;