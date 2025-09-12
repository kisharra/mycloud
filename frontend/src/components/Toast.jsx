import React, { useEffect } from "react"

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000) // скрыть через 3 сек
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="toast">
      {message}
    </div>
  )
}
