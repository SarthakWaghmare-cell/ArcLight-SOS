import { io } from "socket.io-client";

// Set URL to proxy target
const URL = "/";

export const socket = io(URL, {
  autoConnect: true,
});
