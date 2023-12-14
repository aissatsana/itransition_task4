import { sendRequest } from "./sendRequest.js";
let formRegister = document.getElementById("register_form");
let formLogin = document.getElementById("login_form");
formRegister.addEventListener('submit', (e) => {
  e.preventDefault();
  sendRequest('register', formRegister, 'POST');
});

formLogin.addEventListener('submit', (e) => {
  e.preventDefault();
  sendRequest('login', formLogin, 'POST');
});




