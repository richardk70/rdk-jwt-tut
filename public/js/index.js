// make the request to the login endpoint
const btnLogin = document.getElementById('btnLogin');
const btnToken = document.getElementById('btnToken');
btnToken.addEventListener('click', getSecret);

var emailEl = document.getElementById('email');
var passwordEl = document.getElementById('password');
var tokenEl = document.getElementById('token');
var resultEl = document.getElementById('result');
var email = emailEl.value;
var password = passwordEl.value;

function getToken() {
    const loginURL = 'http://localhost:3000/login';
    let data = { email: email, password: password };
    let fetchData = {
        method: 'POST',
        body: JSON.stringify(data),
        // redirect: 'follow',
        // headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }
    }
    resultEl.innerHTML = 'Sending ' + JSON.stringify(data);

    fetch(loginURL, fetchData)
        .then(response => response.json())
        .then(data => localStorage.setItem('token', data.token))
        .catch( err => console.log(err));
}

function getSecret() {
    var token = localStorage.getItem('token');
    var url = 'http://localhost:3000/secret';
    fetch(url, { headers: new Headers({ 'Authorization': 'Bearer ' + token }) }) 
        .then(res => res.text())
        .then(text => resultEl.innerHTML = text)
        .catch( function(err) {
            console.log(err);
        });
}