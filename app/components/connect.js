import { io } from 'socket.io-client';
const socket =io.connect("https://chatplugin-backend.onrender.com")
export default socket