"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, Users, Maximize, Minimize } from "lucide-react"
import { socket } from "../Utils/socket"

const Videocall = ({ selectedUser, userme, onClose, isMinimized = false, onToggleMinimize }) => {
  // State for media controls
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [callStatus, setCallStatus] = useState("connecting")
  const [callTime, setCallTime] = useState(0)
  const [participants, setParticipants] = useState([])
  const [error, setError] = useState(null)

  // Refs for video elements
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const screenShareRef = useRef(null)

  // Refs for WebRTC connections
  const peerConnectionRef = useRef(null)
  const localStreamRef = useRef(null)
  const remoteStreamRef = useRef(null)
  const screenStreamRef = useRef(null)
  const dataChannelRef = useRef(null)

  // Refs for call state
  const isCallInitiator = useRef(false)
  const hasRemoteDescription = useRef(false)
  const pendingCandidates = useRef([])
  const negotiationInProgress = useRef(false)

  // Timer ref for call duration
  const timerRef = useRef(null)

  // Initialize WebRTC when component mounts
  useEffect(() => {
    initializeCall()

    // Set up timer for call duration
    timerRef.current = setInterval(() => {
      setCallTime((prev) => prev + 1)
    }, 1000)

    return () => {
      // Clean up when component unmounts
      endCall()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Initialize WebRTC peer connection and media
  const initializeCall = async () => {
    try {
      // Create peer connection with STUN/TURN servers for NAT traversal
      const configuration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          // Add TURN servers for better connectivity through firewalls
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
        iceCandidatePoolSize: 10,
      }

      peerConnectionRef.current = new RTCPeerConnection(configuration)

      // Create data channel for signaling
      dataChannelRef.current = peerConnectionRef.current.createDataChannel("signaling", {
        ordered: true,
      })

      // Get local media stream with better error handling
      try {
        // Try to get both video and audio
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
      } catch (initialError) {
        console.error("Initial media access error:", initialError)

        // If that fails, try with just audio as fallback
        try {
          localStreamRef.current = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          })
          setIsVideoEnabled(false)
          console.log("Camera access failed, continuing with audio only")
        } catch (audioError) {
          // If audio also fails, try with just video
          try {
            localStreamRef.current = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            })
            setIsAudioEnabled(false)
            console.log("Microphone access failed, continuing with video only")
          } catch (videoError) {
            // If everything fails, throw a detailed error
            throw new Error("Could not access camera or microphone. Please check browser permissions.")
          }
        }
      }

      // Display local video
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current
      }

      // Add local tracks to peer connection - do this BEFORE creating offer/answer
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(track, localStreamRef.current)
          }
        })
      }

      // Set up event handlers for WebRTC connection
      setupPeerConnectionHandlers()

      // Emit socket event to start call
      socket.emit("call:start", {
        callerId: userme._id,
        callerName: userme.name,
        callerAvatar: userme.avatar,
        receiverId: selectedUser._id,
      })

      isCallInitiator.current = true

      // Listen for call acceptance
      socket.on("call:accepted", async (data) => {
        try {
          // Create and send offer when call is accepted
          if (peerConnectionRef.current) {
            await createAndSendOffer()
          }
        } catch (error) {
          console.error("Error creating offer:", error)
          setError("Failed to establish connection. Please try again.")
        }
      })

      // Listen for call rejection
      socket.on("call:rejected", () => {
        alert("Call was rejected")
        onClose()
      })

      // Listen for ICE candidates from the other peer
      socket.on("call:ice-candidate", async (data) => {
        if (data.candidate) {
          try {
            if (peerConnectionRef.current && hasRemoteDescription.current) {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
            } else {
              // Store candidates until remote description is set
              pendingCandidates.current.push(data.candidate)
            }
          } catch (err) {
            console.error("Error adding ICE candidate:", err)
          }
        }
      })

      // Listen for offer from the other peer
      socket.on("call:offer", async (data) => {
        try {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer))
            hasRemoteDescription.current = true

            // Process any pending ICE candidates
            for (const candidate of pendingCandidates.current) {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
            }
            pendingCandidates.current = []

            const answer = await peerConnectionRef.current.createAnswer()
            await peerConnectionRef.current.setLocalDescription(answer)

            socket.emit("call:answer", {
              answer,
              callerId: data.callerId,
              receiverId: userme._id,
            })
          }
        } catch (error) {
          console.error("Error handling offer:", error)
          setError("Failed to process call offer. Please try again.")
        }
      })

      // Listen for answer from the other peer
      socket.on("call:answer", async (data) => {
        try {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer))
            hasRemoteDescription.current = true

            // Process any pending ICE candidates
            for (const candidate of pendingCandidates.current) {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
            }
            pendingCandidates.current = []
          }
        } catch (error) {
          console.error("Error handling answer:", error)
          setError("Failed to establish connection. Please try again.")
        }
      })

      // Listen for call end event
      socket.on("call:end", () => {
        endCall()
        onClose()
      })

      // Add participants
      setParticipants([userme.name, selectedUser.name])
    } catch (error) {
      console.error("Error initializing call:", error)

      // Provide more specific error message based on the error
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setError("Camera or microphone access was denied. Please check your browser permissions.")
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        setError("No camera or microphone found. Please connect a device and try again.")
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        setError("Your camera or microphone is already in use by another application.")
      } else if (error.name === "OverconstrainedError") {
        setError("Your camera doesn't meet the required constraints. Try using a different camera.")
      } else {
        setError(error.message || "Could not access camera or microphone. Please check permissions.")
      }
    }
  }

  // Create and send an offer
  const createAndSendOffer = async () => {
    if (!peerConnectionRef.current || negotiationInProgress.current) return

    try {
      negotiationInProgress.current = true

      // Create offer with specific codec preferences
      const offerOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      }

      const offer = await peerConnectionRef.current.createOffer(offerOptions)

      // Set local description
      await peerConnectionRef.current.setLocalDescription(offer)

      // Send offer to remote peer
      socket.emit("call:offer", {
        offer,
        callerId: userme._id,
        receiverId: selectedUser._id,
      })

      negotiationInProgress.current = false
    } catch (error) {
      console.error("Error creating offer:", error)
      negotiationInProgress.current = false
      throw error
    }
  }

  // Set up event handlers for the peer connection
  const setupPeerConnectionHandlers = () => {
    if (!peerConnectionRef.current) return

    // Handle ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("call:ice-candidate", {
          candidate: event.candidate,
          receiverId: selectedUser._id,
        })
      }
    }

    // Handle ICE connection state changes
    peerConnectionRef.current.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", peerConnectionRef.current.iceConnectionState)

      if (peerConnectionRef.current.iceConnectionState === "failed") {
        // Try to restart ICE if it fails
        peerConnectionRef.current.restartIce()
      }
    }

    // Handle connection state changes
    peerConnectionRef.current.onconnectionstatechange = () => {
      console.log("Connection state:", peerConnectionRef.current.connectionState)

      if (peerConnectionRef.current?.connectionState === "connected") {
        setCallStatus("connected")
      } else if (peerConnectionRef.current?.connectionState === "failed") {
        setError("Connection failed. Please try again.")
        endCall()
      }
    }

    // Handle negotiation needed events
    peerConnectionRef.current.onnegotiationneeded = async () => {
      if (isCallInitiator.current && !negotiationInProgress.current) {
        try {
          await createAndSendOffer()
        } catch (error) {
          console.error("Error during negotiation:", error)
        }
      }
    }

    // Handle incoming tracks (remote video/audio)
    peerConnectionRef.current.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind)

      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream()
      }

      // Add the track to the remote stream
      remoteStreamRef.current.addTrack(event.track)

      // Update the remote video element
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current
      }
    }

    // Handle data channel events
    peerConnectionRef.current.ondatachannel = (event) => {
      const dataChannel = event.channel
      dataChannel.onmessage = (e) => {
        const message = JSON.parse(e.data)
        console.log("Received data channel message:", message)

        // Handle different message types
        if (message.type === "video-state") {
          // Remote user toggled video
        } else if (message.type === "audio-state") {
          // Remote user toggled audio
        }
      }
    }
  }

  // Toggle video on/off
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks()

      videoTracks.forEach((track) => {
        track.enabled = !isVideoEnabled
      })

      setIsVideoEnabled(!isVideoEnabled)

      // Notify other participant about video state
      socket.emit("call:video-toggle", {
        isEnabled: !isVideoEnabled,
        receiverId: selectedUser._id,
      })

      // Also send via data channel for reliability
      if (dataChannelRef.current?.readyState === "open") {
        dataChannelRef.current.send(
          JSON.stringify({
            type: "video-state",
            enabled: !isVideoEnabled,
          }),
        )
      }
    }
  }

  // Toggle audio on/off
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks()

      audioTracks.forEach((track) => {
        track.enabled = !isAudioEnabled
      })

      setIsAudioEnabled(!isAudioEnabled)

      // Notify other participant about audio state
      socket.emit("call:audio-toggle", {
        isEnabled: !isAudioEnabled,
        receiverId: selectedUser._id,
      })

      // Also send via data channel for reliability
      if (dataChannelRef.current?.readyState === "open") {
        dataChannelRef.current.send(
          JSON.stringify({
            type: "audio-state",
            enabled: !isAudioEnabled,
          }),
        )
      }
    }
  }

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((track) => {
            track.stop()

            // Remove screen share tracks from peer connection
            if (peerConnectionRef.current) {
              const senders = peerConnectionRef.current.getSenders()
              const sender = senders.find((s) => s.track === track)
              if (sender) {
                peerConnectionRef.current.removeTrack(sender)
              }
            }
          })

          screenStreamRef.current = null
        }

        if (screenShareRef.current) {
          screenShareRef.current.srcObject = null
        }

        setIsScreenSharing(false)

        // Notify other participant
        socket.emit("call:screen-share-ended", {
          receiverId: selectedUser._id,
        })

        // Re-add camera video track if it was enabled
        if (isVideoEnabled && localStreamRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0]
          if (videoTrack && peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(videoTrack, localStreamRef.current)
          }
        }
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always",
            displaySurface: "monitor",
          },
          audio: false, // Audio from display media can cause feedback
        })

        screenStreamRef.current = screenStream

        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream
        }

        // Replace video track with screen share track
        if (peerConnectionRef.current) {
          const videoTrack = screenStream.getVideoTracks()[0]

          if (videoTrack) {
            const senders = peerConnectionRef.current.getSenders()
            const videoSender = senders.find((sender) => sender.track && sender.track.kind === "video")

            if (videoSender) {
              videoSender.replaceTrack(videoTrack)
            } else {
              peerConnectionRef.current.addTrack(videoTrack, screenStream)
            }
          }
        }

        // Handle the case when user stops sharing via browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare()
        }

        setIsScreenSharing(true)

        // Notify other participant
        socket.emit("call:screen-share-started", {
          receiverId: selectedUser._id,
        })
      }
    } catch (error) {
      console.error("Error toggling screen share:", error)

      if (error.name === "NotAllowedError") {
        setError("Screen sharing was denied. Please grant permission to share your screen.")
      } else {
        setError("Could not share screen. Please try again.")
      }
    }
  }

  // End the call
  const endCall = () => {
    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop())
    }

    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }

    if (screenShareRef.current) {
      screenShareRef.current.srcObject = null
    }

    // Clear socket listeners
    socket.off("call:accepted")
    socket.off("call:rejected")
    socket.off("call:ice-candidate")
    socket.off("call:offer")
    socket.off("call:answer")
    socket.off("call:end")
    socket.off("call:video-toggle")
    socket.off("call:audio-toggle")
    socket.off("call:screen-share-started")
    socket.off("call:screen-share-ended")

    // Notify the other participant
    socket.emit("call:end", {
      receiverId: selectedUser._id,
    })

    setCallStatus("ended")
  }

  // Format call time (mm:ss)
  const formatCallTime = () => {
    const minutes = Math.floor(callTime / 60)
    const seconds = callTime % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Render minimized call view
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 z-50 flex items-center gap-2"
      >
        <div className="w-16 h-16 relative bg-gray-200 rounded-lg overflow-hidden">
          {localStreamRef.current && (
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-medium">{selectedUser.name}</p>
          <p className="text-xs text-green-500">{formatCallTime()}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={endCall} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
            <PhoneOff size={16} />
          </button>
          <button onClick={onToggleMinimize} className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300">
            <Maximize size={16} />
          </button>
        </div>
      </motion.div>
    )
  }

  // Render full call view
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
    >
      <div className="w-full max-w-4xl bg-gray-900 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Call header */}
        <div className="p-4 bg-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src={selectedUser.avatar || "/placeholder.svg"}
              alt={selectedUser.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="text-white font-medium">{selectedUser.name}</h3>
              <p className="text-gray-400 text-sm">
                {callStatus === "connecting" ? "Connecting..." : formatCallTime()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onToggleMinimize) onToggleMinimize()
              }}
              className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600"
            >
              <Minimize size={18} />
            </button>
            <button onClick={endCall} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
              <PhoneOff size={18} />
            </button>
          </div>
        </div>

        {/* Video area */}
        <div className="flex-1 relative bg-gray-800 min-h-[400px]">
          {/* Remote video (main view) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

            {/* Screen share overlay */}
            {isScreenSharing && (
              <div className="absolute inset-0 bg-black">
                <video ref={screenShareRef} autoPlay playsInline className="w-full h-full object-contain" />
              </div>
            )}

            {/* Connecting overlay */}
            {callStatus === "connecting" && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white text-lg">Connecting to {selectedUser.name}...</p>
                  {error && <p className="text-red-400 mt-2">{error}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Local video (picture-in-picture) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden shadow-lg border-2 border-gray-700">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Video disabled overlay */}
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                  <img src={userme.avatar || "/placeholder.svg"} alt="You" className="w-16 h-16 rounded-full" />
                </div>
              </div>
            )}
          </div>

          {/* Participants list button */}
          <div className="absolute top-4 right-4">
            <div className="relative group">
              <button className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600">
                <Users size={18} />
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg p-2 hidden group-hover:block">
                <h4 className="text-white text-sm font-medium mb-2 px-2">Participants ({participants.length})</h4>
                <ul className="space-y-1">
                  {participants.map((name, index) => (
                    <li key={index} className="px-2 py-1 text-gray-300 text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {name} {name === userme.name && "(You)"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call controls */}
        <div className="p-4 bg-gray-800 flex items-center justify-center gap-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full ${
              isAudioEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"
            } text-white`}
          >
            {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${
              isVideoEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"
            } text-white`}
          >
            {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full ${
              isScreenSharing ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
            } text-white`}
          >
            <Monitor size={20} />
          </button>

          <button onClick={endCall} className="p-4 bg-red-500 rounded-full hover:bg-red-600 text-white">
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default Videocall
