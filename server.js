const express = require('express');
const app = express();
const http = require('http');
const {Server} = require('socket.io');
const ACTIONS = require('./src/Actions');
const path = require('path');

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname,'build','index.html'));
});

const userSocketMap = {};
const roomCodeMap = {};

function getAllConnectedClients(roomId){
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({roomId, username}) => {
        // Check if the username already exists in this room with a different socketId
        const existingClientsInRoom = getAllConnectedClients(roomId);
        const existingSocketForUser = existingClientsInRoom.find(
            client => client.username === username
        );

        if (existingSocketForUser && existingSocketForUser.socketId !== socket.id) {
            // If the user already exists with a different socketId, disconnect the old one
            const oldSocketId = existingSocketForUser.socketId;
            const oldSocket = io.sockets.sockets.get(oldSocketId);

            if (oldSocket) {
                // Remove the old socket from the userSocketMap
                delete userSocketMap[oldSocketId];
                // Force the old socket to leave the room
                oldSocket.leave(roomId);
                // Notify other clients that the old socket for this user has disconnected
                socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
                    socketId: oldSocketId,
                    username: username,
                });
                console.log(`Disconnected old socket ${oldSocketId} for user ${username} in room ${roomId}`);
            }
        }

        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients= getAllConnectedClients(roomId);
        console.log('Server-side clients after join:', clients);
        clients.forEach(({socketId}) => {
            io.to(socketId).emit(ACTIONS.JOINED,{
                clients,
                username,
                socketId: socket.id,
            }); 
        });

        // Send the current code to the newly joined client
        if (roomCodeMap[roomId]) {
            io.to(socket.id).emit(ACTIONS.SYNC_CODE, {
                code: roomCodeMap[roomId],
            });
        }
    });

    socket.on(ACTIONS.CODE_CHANGE, ({roomId, code}) => {
        roomCodeMap[roomId] = code;
        socket.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.LEAVE, ({roomId, username}) => {
        console.log(`[ACTIONS.LEAVE] received from socketId: ${socket.id}, username: ${username}, roomId: ${roomId}`);
        console.log('[ACTIONS.LEAVE] userSocketMap before leave:', userSocketMap);
        if (userSocketMap[socket.id]) {
            delete userSocketMap[socket.id];
            socket.leave(roomId);
            const clients = getAllConnectedClients(roomId);
            console.log('[ACTIONS.LEAVE] remaining clients in room:', clients);
            clients.forEach(({socketId: clientSocketId}) => {
                io.to(clientSocketId).emit(ACTIONS.DISCONNECTED, {
                    socketId: socket.id,
                    username: username,
                });
                console.log(`[ACTIONS.LEAVE] Emitted DISCONNECTED for ${username} (socketId: ${socket.id}) to client ${clientSocketId}`);
            });
        }
        if (getAllConnectedClients(roomId).length === 0) {
            delete roomCodeMap[roomId];
        }
        console.log('[ACTIONS.LEAVE] userSocketMap after leave:', userSocketMap);
    });

    socket.on('disconnect', () => {
        console.log(`[disconnect] Socket disconnected: ${socket.id}`);
        const username = userSocketMap[socket.id];
        if (username) {
            console.log(`[disconnect] User ${username} (socketId: ${socket.id}) found in map.`);
            const rooms = Array.from(socket.rooms);
            rooms.forEach(roomId => {
                if (roomId !== socket.id) { // Exclude the default room which is the socket ID itself
                    socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                        socketId: socket.id,
                        username: username,
                    });
                    console.log(`[disconnect] Emitted DISCONNECTED for ${username} (socketId: ${socket.id}) to room ${roomId}`);
                }
                // Clear room code if no clients left in the room
                if (getAllConnectedClients(roomId).length === 0) {
                    delete roomCodeMap[roomId];
                }
            });
            delete userSocketMap[socket.id];
            console.log('[disconnect] userSocketMap after disconnect:', userSocketMap);
        } else {
            console.log(`[disconnect] No user found for socketId: ${socket.id} in map.`);
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));