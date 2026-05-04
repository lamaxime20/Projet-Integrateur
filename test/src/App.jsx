import { useState } from "react";

function App() {
  const [formData, setFormData] = useState({
    nom: "",
    mac_address: "",
    identifiant: "",
    reference: "",
    passkey: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Gestion des inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔹 Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/microcontroleurs/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("✅ Microcontrôleur créé avec succès !");
        setFormData({
          nom: "",
          mac_address: "",
          identifiant: "",
          reference: "",
          passkey: "",
        });
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (error) {
      setMessage("❌ Erreur serveur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>Créer un microcontrôleur</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nom"
          placeholder="Nom"
          value={formData.nom}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="mac_address"
          placeholder="Adresse MAC"
          value={formData.mac_address}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="identifiant"
          placeholder="Identifiant utilisateur"
          value={formData.identifiant}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="reference"
          placeholder="Référence"
          value={formData.reference}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="passkey"
          placeholder="Passkey"
          value={formData.passkey}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Envoi..." : "Créer"}
        </button>
      </form>

      {message && <p style={{ marginTop: "15px" }}>{message}</p>}
    </div>
  );
}

export default App;