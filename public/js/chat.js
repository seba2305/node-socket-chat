const url = (window.location.hostname.includes('localhost'))
            ? 'http://localhost:8080/api/auth/'
            : 'https://node-restserver-production-0a4e.up.railway.app/api/auth/';

let usuario = null;
let socket = null;

const txtUid     = document.querySelector('#txtUid');
const txtMsj     = document.querySelector('#txtMsj');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const btnSalir   = document.querySelector('#btnSalir');


const validarJWT = async() =>{
    
    const token = localStorage.getItem('token') || '';

    if(token.length <= 10){
        window.location = 'index.html';
        throw new Error('No hay token en el servidor');
    }

    const resp = await fetch(url,{
        headers: {'x-token': token }

        });
    
    const {usuario: userDB, token: tokenDB} = await resp.json();
    console.log(userDB, tokenDB);
    localStorage.setItem('token', tokenDB);
    usuario = userDB;
    document.title = usuario.nombre;

    await conectarSocket();
}

const conectarSocket = async() => {

    socket = io({
        'extraHeaders': {
            'x-token' : localStorage.getItem('token')
        }
    });

    socket.on('connect', () =>{
        console.log('Socket online');
    });

    socket.on('disconnect', () =>{
        console.log('Socket offline');
    });

    socket.on('recibir-mensajes', dibujarMensajes);

    socket.on('usuarios-activos', dibujarUsuarios);

    socket.on('mensaje-privado', (payload) =>{
        console.log('Privado: ',payload)
    });

}

const dibujarUsuarios = (usuarios = []) => {

    let usersHtml = '';
    usuarios.forEach(({nombre, uid}) => {

        usersHtml += `
            <li>
                <p>
                    <h5 class="text-success">${nombre}</h5>
                    <span class="fs-6 text-muter">${uid}</span>
                </p>
            </li>
        `;
    });
    ulUsuarios.innerHTML = usersHtml;
}

const dibujarMensajes = (mensajes = []) => {

    let mensajesHtml = '';
    mensajes.forEach(({mensaje, nombre}) => {

        mensajesHtml += `
            <li>
                <p>
                    <span class="text-primary">${nombre} :</span>
                    <span>${mensaje}</span>
                </p>
            </li>
        `;
    });
    ulMensajes.innerHTML = mensajesHtml;
}

txtMsj.addEventListener('keyup', ({keyCode}) => {

    const mensaje = txtMsj.value.trim();
    const uid     = txtUid.value;

    if(keyCode !== 13){return;}
    if(mensaje.length === 0){ return;}

    socket.emit('enviar-mensaje', {mensaje, uid});
    txtMsj.value = '';
})

const main = async() =>{

    await validarJWT()

}

main();
