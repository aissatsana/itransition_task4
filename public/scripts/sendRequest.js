//const server = 'http://localhost:3000/';

function sendRequest (url, data, method) {
  url =  url;
  fetch(url, {
    method: method,
    headers: getHeaders(data),
    body: getBody(data),
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(data => {
        if (response.headers.get('content-type').includes('text/html')) {
          window.location.href = response.url;
        } else {
          const jsonData = JSON.parse(data);
          alert(jsonData.message);
        }
      });
    }
    if (response.headers.get('content-type').includes('application/json')) {
      return response.json().then(data => {
        alert(data.message);
        return data;
      });
    }
    if (response.headers.get('content-type').includes('text/html')) {
      window.location.href = response.url;
    }
  })
  .catch(error => {
    alert(error.message);
  });
};

function getHeaders (data) {
  if (data instanceof HTMLFormElement) {
    return;
  } else if (typeof data === 'object') {
    return {
      'Content-Type': 'application/json'
    };
  }
}

function getBody (data) {
  if (data instanceof HTMLFormElement) {
    return new FormData(data);
  } else if (typeof data === 'object') {
    return JSON.stringify(data);
  }
}

export { sendRequest };