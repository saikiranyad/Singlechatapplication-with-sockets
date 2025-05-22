
import { useState, useEffect, useRef } from "react"
import { Video } from "lucide-react"
import Videocall from "./Videocall"
import { socket } from "../Utils/socket"
import { checkMediaPermissions, requestMediaPermissions } from "../Utils/Permissionchecker"

const Callbutton = ({ selectedUser, userme }) => {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isCallMinimized, setIsCallMinimized] = useState(false)
  const [incomingCall, setIncomingCall] = useState(null)
  const [permissionStatus, setPermissionStatus] = useState({ camera: "unknown", microphone: "unknown" })
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false)

  // Ref to track if component is mounted
  const isMounted = useRef(true)

  // Check permissions on component mount
  useEffect(() => {
    const checkPermissions = async () => {
      const status = await checkMediaPermissions()
      if (isMounted.current) {
        setPermissionStatus(status)
      }
    }

    checkPermissions()

    // Cleanup function
    return () => {
      isMounted.current = false
    }
  }, [])

  // Listen for incoming calls
  useEffect(() => {
    const handleIncomingCall = (data) => {
      if (isMounted.current) {
        setIncomingCall(data)
      }
    }

    socket.on("call:incoming", handleIncomingCall)

    return () => {
      socket.off("call:incoming", handleIncomingCall)
    }
  }, [])

  const startCall = async () => {
    if (isRequestingPermissions) return

    setIsRequestingPermissions(true)

    try {
      // Request permissions before starting call
      if (permissionStatus.camera !== "granted" || permissionStatus.microphone !== "granted") {
        const result = await requestMediaPermissions()

        if (!result.success) {
          // Handle permission denial
          if (result.name === "NotAllowedError" || result.name === "PermissionDeniedError") {
            alert("Camera or microphone access was denied. Please check your browser permissions and try again.")
          } else if (result.name === "NotFoundError") {
            alert("No camera or microphone found. Please connect a device and try again.")
          } else if (result.name === "NotReadableError" || result.name === "TrackStartError") {
            alert(
              "Your camera or microphone is already in use by another application. Please close other applications and try again.",
            )
          } else {
            alert(result.error || "Could not access camera or microphone. Please check permissions.")
          }
          setIsRequestingPermissions(false)
          return
        }

        // Update permission status
        if (isMounted.current) {
          const newStatus = await checkMediaPermissions()
          setPermissionStatus(newStatus)
        }
      }

      // Only start call if we have permissions
      if (isMounted.current) {
        setIsCallActive(true)
        setIsRequestingPermissions(false)
      }
    } catch (error) {
      console.error("Error starting call:", error)
      if (isMounted.current) {
        setIsRequestingPermissions(false)
        alert("Failed to start call. Please try again.")
      }
    }
  }

  const endCall = () => {
    setIsCallActive(false)
    setIsCallMinimized(false)
  }

  const toggleMinimize = () => {
    setIsCallMinimized(!isCallMinimized)
  }

  const acceptIncomingCall = () => {
    socket.emit("call:accept", {
      callerId: incomingCall.callerId,
    })
    setIncomingCall(null)
    setIsCallActive(true)
  }

  const rejectIncomingCall = () => {
    socket.emit("call:reject", {
      callerId: incomingCall.callerId,
    })
    setIncomingCall(null)
  }

  return (
    <>
      {/* Call button */}
      <button
        onClick={startCall}
        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!selectedUser || isRequestingPermissions}
      >
        {isRequestingPermissions ? (
          <div className="w-5 h-5 border-2 border-t-white border-white border-opacity-20 rounded-full animate-spin"></div>
        ) : (
          <Video size={20} />
        )}
      </button>

      {/* Video call component */}
      {isCallActive && (
        <Videocall
          selectedUser={selectedUser}
          userme={userme}
          onClose={endCall}
          isMinimized={isCallMinimized}
          onToggleMinimize={toggleMinimize}
        />
      )}

      {/* Incoming call dialog */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={incomingCall.callerAvatar || "/placeholder.svg"}
                alt={incomingCall.callerName}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="text-xl font-semibold">{incomingCall.callerName}</h3>
                <p className="text-gray-500">Incoming video call...</p>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={rejectIncomingCall}
                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                Decline
              </button>
              <button
                onClick={acceptIncomingCall}
                className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Callbutton
