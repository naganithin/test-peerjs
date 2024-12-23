import React, { useState, useEffect, useRef } from "react";
import Peer from "peerjs";

const ReceiverComponent = () => {
  const [peerId, setPeerId] = useState(null);
  const [status, setStatus] = useState("Awaiting connection...");
  const [messages, setMessages] = useState([]);
  const [conn, setConn] = useState(null);

  const peerRef = useRef(null);
  const messageBoxRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Initialize the peer object
    peerRef.current = new Peer(undefined, {
      debug: 2,
    });

    peerRef.current.on("open", (id) => {
      setPeerId(id);
      setStatus("Awaiting connection...");
    });

    peerRef.current.on("connection", (c) => {
      if (conn && conn.open) {
        c.on("open", () => {
          c.send("Already connected to another client");
          setTimeout(() => c.close(), 500);
        });
        return;
      }
      setConn(c);
      setStatus("Connected");

      c.on("data", handleIncomingData);
      c.on("close", () => {
        setStatus("Connection closed");
        setConn(null);
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

    if (data === "Go") {
      // Handle Go signal (You can trigger video or audio actions here)
    } else if (data === "Fade") {
      // Handle Fade signal
    } else if (data === "Off") {
      // Handle Off signal
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "peer", message: `Peer: ${data}` },
      ]);
    }
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
      <h1>Receiver</h1>
      <div>
        <h2>Status: {status}</h2>
        <h3>ID: {peerId}</h3>
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

      {/* For video/audio */}
      <div>
        <video ref={videoRef} autoPlay></video>
      </div>
    </div>
  );
};

export default ReceiverComponent;
