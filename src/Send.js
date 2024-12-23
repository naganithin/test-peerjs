import React, { useState, useRef, useEffect } from "react";
import Peer from "peerjs";

const Sender = () => {
  const [status, setStatus] = useState("Awaiting connection...");
  const [messages, setMessages] = useState([]);
  const [conn, setConn] = useState(null);
  const [peerIdInput, setPeerIdInput] = useState("");

  const peerRef = useRef(null);
  const messageBoxRef = useRef(null);
  const connectButtonRef = useRef(null);

  useEffect(() => {
    // Initialize the peer object for sender
    peerRef.current = new Peer(undefined, {
      debug: 2,
    });

    peerRef.current.on("open", (id) => {
      console.log("Sender ID:", id);
    });

    peerRef.current.on("connection", (c) => {
      c.on("open", () => {
        setStatus(`Connected to: ${c.peer}`);
        setConn(c);
        c.on("data", handleIncomingData);
        c.on("close", () => {
          setStatus("Connection closed");
          setConn(null);
        });
      });
    });

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  const handleIncomingData = (data) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "peer", message: data },
    ]);
  };

  const handleConnect = () => {
    const conn = peerRef.current.connect(peerIdInput, {
      reliable: true,
    });
    conn.on("open", () => {
      setStatus(`Connected to: ${conn.peer}`);
      setConn(conn);
    });
  };

  const handleSendMessage = () => {
    if (conn && conn.open) {
      const message = messageBoxRef.current.value;
      messageBoxRef.current.value = "";
      conn.send(message);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "self", message: message },
      ]);
    } else {
      console.log("Connection is closed");
    }
  };

  const handleClearMessages = () => {
    setMessages([]);
  };

  return (
    <div>
      <h1>Sender</h1>
      <div>
        <input
          type="text"
          value={peerIdInput}
          onChange={(e) => setPeerIdInput(e.target.value)}
          placeholder="Enter Receiver ID"
        />
        <button ref={connectButtonRef} onClick={handleConnect}>
          Connect
        </button>
      </div>
      <div>
        <h2>Status: {status}</h2>
      </div>
      <div>
        <input
          type="text"
          ref={messageBoxRef}
          placeholder="Enter a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
        <button onClick={handleClearMessages}>Clear Messages</button>
      </div>

      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sender;
