let $ = document;
let formRegister = $.querySelector('.register-form');
let usernameInput = $.getElementById('user');
let passwordInput = $.getElementById('pass');
let emailInput = $.getElementById('email');
let mainList = document.querySelector('.main-list')
let db = null;
let objectStore = null;

window.addEventListener('load', () => {
    let DBOpenRequest = indexedDB.open('SabzLearn', 1);

    DBOpenRequest.addEventListener('error', err => {
        console.warn('Error', err)
    })

    DBOpenRequest.addEventListener('success', event => {
        db = event.target.result;
        getUsers()
        console.log('Success', event);
    })

    DBOpenRequest.addEventListener('upgradeneeded', event => {
        db = event.target.result;

        console.log('Old Version', event.oldVersion);
        console.log(db);
        console.log('New Version', event.newVersion);

        if (!db.objectStoreNames.contains('users')) {
            objectStore = db.createObjectStore('users', {
                keyPath: 'UserID'
            });

            console.log('objectStoreNames', db.objectStoreNames);
        }

    })
})

formRegister.addEventListener('submit', event => {
    event.preventDefault();

    let newUser = {
        UserID: Math.round(Math.random() * 88888),
        Username: usernameInput.value,
        Password: passwordInput.value,
        Email: emailInput.value
    }

    let userTransaction = createTransaction('users', 'readwrite');

    let userStore = userTransaction.objectStore('users');;
    let userRequest = userStore.add(newUser);

    userRequest.addEventListener('error', err => {
        console.warn('Request Error', err)
    })

    userRequest.addEventListener('success', event => {
        console.log('Request Success', event);
        getUsers();
        cleareInputs();
    })
})

function createTransaction(storeName, mode) {
    let tranasct = db.transaction(storeName, mode);

    tranasct.addEventListener('error', err => {
        console.warn('Transaction Error', err)
    })

    tranasct.addEventListener('success', event => {
        console.log('Transaction Success', event);
    })
    return tranasct
}

function cleareInputs() {
    usernameInput.value = "";
    passwordInput.value = "";
    emailInput.value = "";
}

function getUsers() {
    let getTransaction = createTransaction('users', 'readonly');

    getTransaction.addEventListener('complete', event => {
        console.log('Complete', event)
    })

    let getStore = getTransaction.objectStore('users');
    let getrequest = getStore.getAll();

    getrequest.addEventListener('error', err => {
        console.warn('Get Request Error', err)
    })

    getrequest.addEventListener('success', event => {
        console.log('Get Request Success', event);
        let allUsers = event.target.result;

        mainList.innerHTML = allUsers.map(user => {
            return `<div class="list-item">
            <div class="id">${user.UserID}</div>
            <div class="name">${user.Username}</div>
            <div class="password">${user.Email}</div>
            <div class="email">${user.Password}</div>
            <div class="action"><a href="#" onclick="deleteUser(${user.UserID},event)" >Remove</a></div>
            
        </div> `
        }).join('');
    })
}

function deleteUser(userID, event) {
    event.preventDefault();
    let deleteTransaction = createTransaction('users', 'readwrite');

    deleteTransaction.addEventListener('complete', event => {
        console.log('Delete User Complete', event)
    })

    let deleteStore = deleteTransaction.objectStore('users');
    let deleteRequest = deleteStore.delete(userID);

    deleteRequest.addEventListener('error', err => {
        console.warn('Delete Request Error', err)
    })

    deleteRequest.addEventListener('success', event => {
        console.log('Delete Request Success', event);
    })
    getUsers();
}