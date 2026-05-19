import "./css/Profile.css";
import { useState, useEffect } from "react";
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
  const [role, setRole] = useState("");
  const [second_phone, setSecond_phone] = useState("");
  const [documento, setDocumento] = useState("");
  const [representante, setRepresentante] = useState("");
  const [nacionalidad, setNacionalidad] = useState("");
  const [sexo, setSexo] = useState("");
  const [type_documente, setType_documente] = useState("");

  useEffect(() => {
    const rawToken = localStorage.getItem("token");
    const payload = parseJwt(rawToken);

    if (!payload) {
      navigate("/login");
      return;
    }
    console.log("Payload id:", payload.id);
    console.log("Payload role:", payload.role);

    axios
      .get("http://localhost:3001/users/userdate", {
        params: { id: payload.id, clid: payload.clid, role: payload.role },
      })
      .then((res) => {
        const { client, user, lender } = res.data;

        setRole(payload.role?.trim().toLowerCase());

        if (payload.role === "cliente") {
          // datos de client
          setFirst_name(client.first_name || "");
          setLast_name(client.last_name || "");
          setPhone(client.phone || "");
          setNationality(client.nationality || "");
          setDocument(client.document || "");
          setDocument_type(client.document_type || "");
          setAddress(user.address || "");
          setBirth_date(
            client.birth_date ? client.birth_date.split("T")[0] : "",
          );
          setEstado_civil(client.Estado_civil || "");
          setOccupation(client.ocupation || "");
          setCity(client.city || "");
          setUsername(user.username || "");
        } else if (payload.role === "prestamista") {
          // datos de lender
          setAddress(lender.address || "");
          setPhone(lender.phone || "");
          setSecond_phone(lender.second_phone || "");
          setUsername(user.username || "");
          setDocumento(lender.documento || "");
          setRepresentante(lender.representante || "");
          setNacionalidad(lender.nacionalidad || "");
          setEstado_civil(lender.estado_civil || "");
          setSexo(lender.sexo || "");
          setType_documente(lender.type_documente || "");
        }
      })
      .catch((err) => {
        console.error("Error al cargar datos:", err);
      });
  }, []);


  const validateDocumento = () => {
  if (type_documente === "persona") {
    // Validar cédula (11 dígitos)
    const cedulaRegex = /^[0-9]{11}$/;
    if (!cedulaRegex.test(documento)) {
      Swal.fire({
        icon: "warning",
        title: "Cédula inválida",
        text: "La cédula debe tener exactamente 11 dígitos numéricos.",
      });
      return false;
    }
  }

  if (type_documente === "empresa") {
    // Validar RNC (9 dígitos)
    const rncRegex = /^[0-9]{9}$/;
    if (!rncRegex.test(documento)) {
      Swal.fire({
        icon: "warning",
        title: "RNC inválido",
        text: "El RNC debe tener exactamente 9 dígitos numéricos.",
      });
      return false;
    }
  }

  return true;
};




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
    if (payload.role === "cliente") {
      if (
        !first_name ||
        !last_name ||
        !phone ||
        !nationality ||
        !document ||
        !document_type ||
        !address ||
        !city ||
        !birth_date ||
        !Estado_civil ||
        !occupation ||
        !username
      ) {
        Swal.fire({
          icon: "warning",
          title: "Campos obligatorios",
          text: "Todos los campos son obligatorios",
        });

        return;
      }
    }

   if (payload.role === "prestamista") {
  // Validación para persona física
  if (type_documente === "persona") {
    if (
      !address ||
      !phone ||
      !second_phone ||
      !documento ||
      !nacionalidad ||
      !Estado_civil ||
      !sexo ||
      !username
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Todos los campos de persona física son obligatorios",
      });
      return;
    }
    if (!validateDocumento()) {
      return;
    }
  }

  // Validación para empresa
  if (type_documente === "empresa") {
    if (
      !address ||
      !phone ||
      !second_phone ||
      !documento ||
      !representante ||
      !username
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Todos los campos de empresa son obligatorios",
      });
      return;
    }
    if (!validateDocumento()) {
      return;
    }

    




  }










  






}


    try {
      let body = {
        id: payload.id,
        clid: payload.clid,
        role: payload.role,
        username,
      };

      console.log("Datos a enviar:", payload.role);

      if (payload.role === "cliente") {
        body = {
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
        };
      } else if (payload.role === "prestamista") {
        body = {
          id: payload.id,
          clid: payload.clid,
          role: payload.role,
          username,
          address,
          phone,
          second_phone,
          documento,
          representante,
          nacionalidad,
          Estado_civil,
          sexo,
        };
      }

      const response = await axios.put(
        "http://localhost:3001/users/updateUser",
        body,
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
  {/* ================= CLIENTE ================= */}
  {role === "cliente" && (
    <>
      {/* INFORMACIÓN PERSONAL */}
      <div className="form-section">
        <h3>Información Personal</h3>

        <div className="form-grid">
          <div className="input-group">
            <label>Nombre</label>
            <input
              name="first_name"
              value={first_name}
              onChange={(e) => setFirst_name(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Apellido</label>
            <input
              name="last_name"
              value={last_name}
              onChange={(e) => setLast_name(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Teléfono</label>
            <input
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Nacionalidad</label>
            <input
              name="nationality"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Fecha de nacimiento</label>
            <input
              type="date"
              name="birth_date"
              value={birth_date}
              onChange={(e) => setBirth_date(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Estado civil</label>
            <input
              name="Estado_civil"
              value={Estado_civil}
              onChange={(e) => setEstado_civil(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* INFORMACIÓN LABORAL */}
      <div className="form-section">
        <h3>Información Laboral</h3>

        <div className="form-grid">
          <div className="input-group">
            <label>Ocupación</label>
            <input
              name="occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* DOCUMENTOS */}
      <div className="form-section">
        <h3>Documentación</h3>

        <div className="form-grid">
          <div className="input-group">
            <label>Documento</label>
            <input
              name="document"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Tipo de documento</label>
            <input
              name="document_type"
              value={document_type}
              onChange={(e) => setDocument_type(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* DIRECCIÓN */}
      <div className="form-section">
        <h3>Dirección</h3>

        <div className="form-grid">
          <div className="input-group full-width">
            <label>Dirección</label>
            <input
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Ciudad</label>
            <input
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
        </div>
      </div>
    </>
  )}

  {/* ================= PRESTAMISTA ================= */}
  {role === "prestamista" && (
    <>
      {/* INFORMACIÓN GENERAL */}
      <div className="form-section">
        <h3>Información General</h3>

        <div className="form-grid">
          <div className="input-group">
            <label>Tipo de Prestamista</label>

            <select
              name="type_documente"
              value={type_documente}
              onChange={(e) => setType_documente(e.target.value)}
              required
            >
              <option value="">Seleccione...</option>
              <option value="persona">Persona Física</option>
              <option value="empresa">Empresa</option>
            </select>
          </div>

          <div className="input-group">
            <label>Teléfono</label>

            <input
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Segundo Teléfono</label>

            <input
              name="second_phone"
              value={second_phone}
              onChange={(e) => setSecond_phone(e.target.value)}
            />
          </div>

          <div className="input-group full-width">
            <label>Dirección</label>

            <input
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* PERSONA FÍSICA */}
      {type_documente === "persona" && (
        <div className="form-section">
          <h3>Información Personal</h3>

          <div className="form-grid">
            <div className="input-group">
              <label>Documento (Cédula)</label>

              <input
                name="documento"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Nacionalidad</label>

              <input
                name="nacionalidad"
                value={nacionalidad}
                onChange={(e) => setNacionalidad(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Estado Civil</label>

              <select
                name="estado_civil"
                value={Estado_civil}
                onChange={(e) => setEstado_civil(e.target.value)}
                required
              >
                <option value="">Seleccione...</option>
                <option value="soltero">Soltero</option>
                <option value="casado">Casado</option>
                <option value="divorciado">Divorciado</option>
                <option value="viudo">Viudo</option>
              </select>
            </div>

            <div className="input-group">
              <label>Sexo</label>

              <select
                name="sexo"
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                required
              >
                <option value="">Seleccione...</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* EMPRESA */}
      {type_documente === "empresa" && (
        <div className="form-section">
          <h3>Información Empresarial</h3>

          <div className="form-grid">
            <div className="input-group">
              <label>Documento (RNC)</label>

              <input
                name="documento"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Representante Legal</label>

              <input
                name="representante"
                value={representante}
                onChange={(e) => setRepresentante(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      )}
    </>
  )}

  {/* CUENTA */}
  <div className="form-section">
    <h3>Cuenta</h3>

    <div className="form-grid">
      <div className="input-group">
        <label>Nombre de usuario</label>

        <input
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
    </div>
  </div>

  <button type="submit" className="save-btn">
    Guardar cambios
  </button>
</form>
    </div>
  );
}

export default Profile;
