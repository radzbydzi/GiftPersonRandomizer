export interface WSContextType {
  lastJsonMessage: object,
  sendJsonMessage: (message: object) => void
}