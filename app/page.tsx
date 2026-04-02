"use client"

import { useEffect, useState } from "react"

export default function Home() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking")

  useEffect(() => {
    fetch("https://vikas-bhatt-classes-server.onrender.com/api/health")
      .then(res => res.ok ? setStatus("online") : setStatus("offline"))
      .catch(() => setStatus("offline"))
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {status === "checking" && <p className="text-gray-500">Checking server...</p>}
        {status === "online" && <p className="text-green-500 font-semibold">✅ Server is running</p>}
        {status === "offline" && <p className="text-red-500 font-semibold">❌ Server is offline</p>}
      </div>
    </div>
  )
}