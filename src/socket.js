import { io } from "socket.io-client";

export const initSocket = () => {
  return io(
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5000",
    {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 10000,
    }
  );
};