import { io } from "socket.io-client";
const apiUrl = "https://ige.onrender.com";
//const apiUrl = "http://localhost:3000";

const socket = io(`${apiUrl}`); // TODO: Cambiarla luego al que tenemos en el process

export default socket;
