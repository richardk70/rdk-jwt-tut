const fb = document.getElementById('feedback');
const btnRegister = document.getElementById('btnRegister');
var nameEl = document.getElementById('name');
var emailEl = document.getElementById('email');
var passwordEl = document.getElementById('password');
var password2El = document.getElementById('password2');
var resultEl = documnet.getElementById('result');

btnRegister.addEventListener('click', createUser);

function createUser() {
    if (passwordEl.value !== password2El.value) {
        fb.innerHTML = 'Passwords do not match.';
        passwordEl.value = '';
        password2El.value = '';
        createUser();
    }
    else if (passwordEl.value.length < 4) {
        fb.innerHTML = 'Password not long enough.';
        passwordEl.value = '';
        password2El.value = '';
        createUser();
    }
    
    var name = nameEl.value;
    var email = emailEl.value;
    var password = passwordEl.value;

    const createURL = 'http://localhost:3000/users';
    let data = { name, email, password };
    let fetchData = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json; charset=UTF-8'}
    }
    resultEl.innerHTML = 'Sending ' + JSON.stringify(data);

    fetch(createURL, fetchData)
        .then(response => response.json())
        .then(data => console.log(data))
        .catch( err => {
            console.log(err);
        });
}