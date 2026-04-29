import { useEffect, useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const API_BASE = "https://projet-integrateur-do3r.onrender.com/api";

  // ===== RECUPERER LES MESSAGES =====
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/messages`);
      const data = await res.json();
      setMessages(data.reverse()); // plus récent en haut
    } catch (err) {
      console.error(err);
    }
  };

  // ===== ENVOYER MESSAGE =====
  const sendMessage = async () => {
    if (!newMessage) return;

    try {
      await fetch(`${API_BASE}/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_id: "esp32_01",
          message: newMessage,
        }),
      });

      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  // ===== AUTO REFRESH =====
  useEffect(() => {
    fetchMessages();

    const interval = setInterval(() => {
      fetchMessages();
    }, 5000); // refresh toutes les 5s

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>📡 Test ESP32 MQTT</h2>

      {/* INPUT */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Nouveau message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ padding: 10, width: "300px", marginRight: 10 }}
        />

        <button onClick={sendMessage} style={{ padding: 10 }}>
          Envoyer
        </button>
      </div>

      {/* LISTE MESSAGES */}
      <h3>📜 Messages reçus</h3>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 10,
          maxHeight: 300,
          overflowY: "auto",
        }}
      >
        {messages.length === 0 ? (
          <p>Aucun message</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              style={{
                padding: 8,
                borderBottom: "1px solid #eee",
                fontSize: 14,
              }}
            >
              {msg}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;