import React, { useState, useEffect, useRef } from "react";
import Peer from "peerjs";

const App = () => {
  const [peerId, setPeerId] = useState(null);
  const [peer, setPeer] = useState(null);
  const [call, setCall] = useState(null);
  const [stream, setStream] = useState(null);
  const [isCalling, setIsCalling] = useState(false);

  // Refs for video elements
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    // Initialize peer object
    const newPeer = new Peer();
    console.log("id",newPeer);
    

    newPeer.on("open", (id) => {
      setPeerId(id); // Get the peer ID
      setPeer(newPeer);
    });

    newPeer.on("call", (incomingCall) => {
      // Answer incoming call
      setCall(incomingCall);
      incomingCall.answer(stream);
      incomingCall.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });
    });

    // Cleanup on component unmount
    return () => {
      if (newPeer) newPeer.destroy();
    };
  }, [stream]);

  useEffect(() => {
    // Get user media (camera and microphone)
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((userStream) => {
        setStream(userStream);
        localVideoRef.current.srcObject = userStream;
      })
      .catch((err) => {
        console.error("Failed to get local stream", err);
      });
  }, []);

  const startCall = (remotePeerId) => {
    if (peer) {
      const call = peer.call(remotePeerId, stream);
      setIsCalling(true);
      call.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });
    }
  };

  const answerCall = () => {
    if (call) {
      call.answer(stream);
      setIsCalling(true);
      call.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });
    }
  };

  const endCall = () => {
    if (call) {
      call.close();
      setIsCalling(false);
      remoteVideoRef.current.srcObject = null;
    }
  };

  return (
    <div>
      <h2>Peer-to-Peer Video Call</h2>
      <div>
        <p>Your Peer ID: {peerId}</p>
      </div>

      <div>
        <video ref={localVideoRef} autoPlay muted width="300" />
        <video ref={remoteVideoRef} autoPlay width="300" />
      </div>

      <div>
        {!isCalling ? (
          <div>
            <input
              type="text"
              placeholder="Enter remote peer ID"
              id="remotePeerId"
            />
            <button
              onClick={() =>
                startCall(document.getElementById("remotePeerId").value)
              }
            >
              Start Call
            </button>
          </div>
        ) : (
          <div>
            <button onClick={endCall}>End Call</button>
          </div>
        )}

        {call && !isCalling && (
          <div>
            <button onClick={answerCall}>Answer Call</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
