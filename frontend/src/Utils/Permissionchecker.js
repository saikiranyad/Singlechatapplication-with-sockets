// Function to check if the browser supports getUserMedia
export const checkMediaDevicesSupport = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

// Function to check if the browser has permission to access media devices
export const checkMediaPermissions = async () => {
  try {
    // Check for permissions API support
    if (navigator.permissions && navigator.permissions.query) {
      try {
        // Check camera permission
        const cameraResult = await navigator.permissions.query({ name: "camera" })
        // Check microphone permission
        const microphoneResult = await navigator.permissions.query({ name: "microphone" })

        return {
          camera: cameraResult.state,
          microphone: microphoneResult.state,
          // 'granted', 'denied', or 'prompt'
        }
      } catch (error) {
        console.error("Error querying permissions:", error)
        // Some browsers might not support querying specific permissions
        return { camera: "unknown", microphone: "unknown" }
      }
    } else {
      // Permissions API not supported, return unknown
      return { camera: "unknown", microphone: "unknown" }
    }
  } catch (error) {
    console.error("Error checking permissions:", error)
    return { camera: "error", microphone: "error" }
  }
}

// Function to enumerate available media devices
export const listMediaDevices = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error("Media Devices API not supported")
    }

    const devices = await navigator.mediaDevices.enumerateDevices()

    const videoDevices = devices.filter((device) => device.kind === "videoinput")
    const audioDevices = devices.filter((device) => device.kind === "audioinput")

    return {
      videoDevices,
      audioDevices,
      hasCamera: videoDevices.length > 0,
      hasMicrophone: audioDevices.length > 0,
    }
  } catch (error) {
    console.error("Error listing media devices:", error)
    return {
      videoDevices: [],
      audioDevices: [],
      hasCamera: false,
      hasMicrophone: false,
      error: error.message,
    }
  }
}

// Function to request permissions explicitly with better error handling
export const requestMediaPermissions = async () => {
  try {
    // First try to request both permissions
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    return { success: true }
  } catch (initialError) {
    console.error("Initial permission request error:", initialError)

    // If both fail, try with just audio
    try {
      await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
      // We got audio but not video
      return {
        success: true,
        partial: true,
        video: false,
        audio: true,
        name: initialError.name,
        message: "Video permission denied but audio granted",
      }
    } catch (audioError) {
      // If audio fails, try with just video
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        // We got video but not audio
        return {
          success: true,
          partial: true,
          video: true,
          audio: false,
          name: initialError.name,
          message: "Audio permission denied but video granted",
        }
      } catch (videoError) {
        // Both video and audio failed
        return {
          success: false,
          error: initialError.message,
          name: initialError.name,
        }
      }
    }
  }
}

// Function to check if a specific device is available
export const isDeviceAvailable = async (kind) => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.some((device) => device.kind === kind)
  } catch (error) {
    console.error(`Error checking for ${kind}:`, error)
    return false
  }
}

// Function to get user media with specific constraints and fallbacks
export const getUserMediaWithFallbacks = async () => {
  const results = {
    stream: null,
    video: false,
    audio: false,
    error: null,
  }

  try {
    // Try with both video and audio
    results.stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    results.video = true
    results.audio = true
    return results
  } catch (error) {
    console.log("Could not get both video and audio:", error.name)

    // Try with just video
    try {
      results.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
      results.video = true
      return results
    } catch (videoError) {
      console.log("Could not get video:", videoError.name)

      // Try with just audio
      try {
        results.stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        })
        results.audio = true
        return results
      } catch (audioError) {
        console.log("Could not get audio:", audioError.name)

        // All attempts failed
        results.error = {
          name: error.name,
          message: error.message,
        }
        return results
      }
    }
  }
}
