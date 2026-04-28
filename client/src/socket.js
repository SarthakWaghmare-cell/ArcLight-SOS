import { io } from "socket.io-client";

// Connect directly to the deployed Render backend
const URL = "https://arclight-sos.onrender.com";

export const socket = io(URL, {
  autoConnect: true,
});
