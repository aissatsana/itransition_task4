import { sendRequest } from "./sendRequest.js";

document.getElementById('selectAll').addEventListener('change', function () {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = this.checked;
  });
});

const logoutLink = document.getElementById('logout')
logoutLink.addEventListener('click', function (e) {
  e.preventDefault();
  sendRequest('logout', logoutLink, 'POST');
})