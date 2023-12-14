import { sendRequest } from "./sendRequest.js";

const blockSelectedButton = document.getElementById('blockSelected');
const unblockSelectedButton = document.getElementById('unblockSelected');
const deleteSelectedButton = document.getElementById('deleteSelected');

blockSelectedButton.addEventListener('click', () => changeCondition('block', 'POST'))
unblockSelectedButton.addEventListener('click', () => changeCondition('unblock', 'POST'))
deleteSelectedButton.addEventListener('click', () => changeCondition('delete', 'DELETE'))


function getSelectedUsers() {
  const selectedUserCheckboxes = document.querySelectorAll('tbody input[type="checkbox"]:checked');
  const selectedUsers = [];
  selectedUserCheckboxes.forEach((checkbox) => {
    const userId = checkbox.id;
    selectedUsers.push(userId);
  });
  return selectedUsers;
}


function changeCondition (url, method) {
  const selectedUsers = getSelectedUsers(); 
  url =  url + '-users';
  sendRequest(url, { userIds: selectedUsers }, method);
}