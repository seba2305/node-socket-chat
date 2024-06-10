const { comprobarJWT } = require("../helpers");
const { ChatMensajes } = require("../models");

const chatMensajes = new ChatMensajes();

const socketController = async(socket, io) => {

    const usuario = await comprobarJWT(socket.handshake.headers['x-token']);
    if(!usuario){
        return socket.disconnect();
    }

    chatMensajes.conectarUsuario(usuario);
    io.emit('usuarios-activos', chatMensajes.usuarioArr);
    socket.emit('recibir-mensajes', chatMensajes.ultimosMensajes);

    socket.join(usuario.id);

    socket.on('disconnect', () =>{
        chatMensajes.desconectarUsuario(usuario.id);
        io.emit('usuarios-activos', chatMensajes.usuarioArr);
    });

    socket.on('enviar-mensaje', ({uid, mensaje}) =>{
        
        if(uid){
            // Mensaje privado
            socket.to(uid).emit('mensaje-privado',{de: usuario.nombre, mensaje});
        }else{
            chatMensajes.enviarMensaje(usuario.id, usuario.nombre, mensaje);
            io.emit('recibir-mensajes', chatMensajes.ultimosMensajes);
        }

    })

}


module.exports = {
    socketController
}


