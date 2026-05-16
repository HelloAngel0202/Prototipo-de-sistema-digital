import "./css/Profile.css";
import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function parseJwt(token) {
  if (!token) return null;
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
  return JSON.parse(jsonPayload);
}

function Profile() {

  const navigate = useNavigate();
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [document, setDocument] = useState("");
  const [document_type, setDocument_type] = useState("");
  const [address, setAddress] = useState("");
  const [birth_date, setBirth_date] = useState("");
  const [Estado_civil, setEstado_civil] = useState("");
  const [occupation, setOccupation] = useState("");
  const [city, setCity] = useState("");
  const [username, setUsername] = useState("");


  



  useEffect(() => {
    const rawToken = localStorage.getItem("token");
    const payload = parseJwt(rawToken);

    if (!payload) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:3001/users/userdate", {
        params: { id: payload.id, clid: payload.clid,role: payload.role },
      })
      .then((res) => {
        const { client, user } = res.data;
        const cleanDate = client.birth_date
      ? client.birth_date.split("T")[0]
      : "";

        setFirst_name(client.first_name || "");
        setLast_name(client.last_name || "");
        setPhone(client.phone || "");
        setNationality(client.nationality || "");
        setDocument(client.document || "");
        setDocument_type(client.document_type || "");
        setAddress(user.address || "");
        setBirth_date(cleanDate);
        setEstado_civil(client.Estado_civil || "");
        setOccupation(client.ocupation || "");
        setCity(client.city || "");
        setUsername(user.username || "");
      })
      .catch((err) => {
        console.error("Error al cargar datos:", err);
      });
  }, []);
















  const handleSubmit = async (e) => {
    e.preventDefault();

    const rawToken = localStorage.getItem("token");
    const payload = parseJwt(rawToken);

    const tokenValido = payload && payload.exp * 1000 > Date.now();

    if (!tokenValido) {
      alert("Tu sesión ha expirado.");
      navigate("/login");
      return;
    }

    const updatedFormData = {
      clid: payload.clid,
    };

    console.log(updatedFormData);
    const data = new FormData();

    Object.keys(updatedFormData).forEach((key) => {
      data.append(key, updatedFormData[key]);
    });

    try {
      const response = await axios.put(
        "http://localhost:3001/users/updateUser",
        {
          id: payload.id,
          clid: payload.clid,
          role: payload.role,
          first_name,
          last_name,
          phone,
          nationality,
          document,
          document_type,
          address,
          city,
          birth_date,
          Estado_civil,
          occupation,
          username,
        },
      );

      console.log("Respuesta del servidor:", response.data);

      Swal.fire({
        title: "Guardado",
        html: response.data.message || "¡Registro exitoso!",
        icon: "success",
        timer: 3000,
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No se pudo registrar el usuario",
      });
    }
  };

  return (
    <div className="profile-container">
      <h2>Editar Perfil</h2>

      <form className="profile-form" onSubmit={handleSubmit}>
        <label>Nombre</label>
        <input
          name="first_name"
          value={first_name}
          onChange={(e) => setFirst_name(e.target.value)}
        />

        <label>Apellido</label>
        <input
          name="last_name"
          value={last_name}
          onChange={(e) => setLast_name(e.target.value)}
        />

        <label>Teléfono</label>
        <input
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label>Nacionalidad</label>
        <input
          name="nationality"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
        />
        <label>Fecha de nacimiento</label>
        <input
          type="date"
          name="birth_date"
          value={birth_date}
          onChange={(e) => setBirth_date(e.target.value)}
        />

        <label>Estado civil</label>
        <input
          name="Estado_civil"
          value={Estado_civil}
          onChange={(e) => setEstado_civil(e.target.value)}
        />

        <label>Ocupación</label>
        <input
          name="occupation"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
        />

        <label>Documento</label>
        <input
          name="document"
          value={document}
          onChange={(e) => setDocument(e.target.value)}
        />

        <label>Tipo de documento</label>
        <input
          name="document_type"
          value={document_type}
          onChange={(e) => setDocument_type(e.target.value)}
        />

        <label>Dirección</label>
        <input
          name="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <label>Ciudad</label>
        <input
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <label>Nombre de usuario</label>
        <input
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button type="submit">Guardar cambios</button>
      </form>
    </div>
  );
}

export default Profile;
