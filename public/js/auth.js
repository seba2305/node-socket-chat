const miForm = document.querySelector('form');

const url = (window.location.hostname.includes('localhost'))
            ? 'http://localhost:8080/api/auth/'
            : 'https://node-restserver-production-0a4e.up.railway.app/api/auth/';

miForm.addEventListener('submit', ev => {

    ev.preventDefault();
    const formData = {};

    for (const el of miForm.elements) {
        if(el.name.length > 0)
            formData[el.name] = el.value;
    }
    
    fetch(url + 'login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((resp) => resp.json())
        .then((resp) => {
          console.log(resp);
          localStorage.setItem("email", resp.usuario.correo);
          localStorage.setItem("token", resp.token);
          window.location = 'chat.html';
        })
        .catch(err =>{
            console.log(err);
        });

})


function handleCredentialResponse(response) {
  const body = { id_token: response.credential };
  //  console.log(response.credential);
  fetch(url + 'google', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((resp) => resp.json())
    .then((resp) => {
      console.log(resp);
      localStorage.setItem("email", resp.usuario.correo);
      localStorage.setItem("token", resp.token);
      window.location = 'chat.html';
    })
    .catch(console.warn);
}

function cerrarSesion() {
  google.accounts.id.disableAutoSelect();

  google.accounts.id.revoke(localStorage.getItem("email"), (done) => {
    localStorage.clear();
    location.reload();
  });
  // const button_signout = document.getElementById('google_signout');
  // button_signout.onclick = () => {
  //   console.log(google.accounts.id)
  //   google.accounts.id.disableAutoSelect()
  //   google.accounts.id.revoke(localStorage.getItem('email'), done => {
  //     localStorage.clear();
  //     location.reload();
  //   })
}
