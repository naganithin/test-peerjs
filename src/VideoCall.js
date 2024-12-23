import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";

const VideoCall = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [connectionEstablished, setConnectionEstablished] = useState(false);
  const [offerSignal, setOfferSignal] = useState(null);
  const [answerSignal, setAnswerSignal] = useState(null);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    // Get user's media stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Error accessing media devices:", err));
  }, []);

  const createPeer = (initiator) => {
    const newPeer = new Peer({
      initiator,
      trickle: false,
      stream: localStream,
    });

    newPeer.on("signal", (data) => {
      if (initiator) {
        setOfferSignal(JSON.stringify(data));
      } else {
        setAnswerSignal(JSON.stringify(data));
      }
    });

    newPeer.on("stream", (stream) => {
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    setPeer(newPeer);
  };

  const initiateCall = () => {
    createPeer(true);
  };

  const answerCall = () => {
    createPeer(false);
  };

  const connectPeers = () => {
    if (peer) {
      peer.signal(JSON.parse(answerSignal));
      setConnectionEstablished(true);
    }
  };

  return (
    <div>
      <h2>P2P Video Call</h2>
      <div>
        <video ref={localVideoRef} autoPlay muted playsInline />
        <video ref={remoteVideoRef} autoPlay playsInline />
      </div>
      {!connectionEstablished && (
        <div>
          <button onClick={initiateCall}>Start Call</button>
          <button onClick={answerCall}>Answer Call</button>
        </div>
      )}
      {offerSignal && (
        <div>
          <p>Share this offer signal with the other peer:</p>
          <textarea readOnly value={offerSignal} />
        </div>
      )}
      {!connectionEstablished && (
        <div>
          <p>Enter the answer signal from the other peer:</p>
          <textarea
            value={answerSignal}
            onChange={(e) => setAnswerSignal(e.target.value)}
          />
          <button onClick={connectPeers}>Connect</button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
