let $ = document;
const registerForm = $.querySelector('.register-form');
const usernameInput = $.getElementById('user');
const passwordInput = $.getElementById('pass');
const emailInput = $.getElementById('email');
const mainList = $.querySelector('.main-list');
let db = null;   /// for working easy with event.target.result in all levels
let objectStore = null;

window.addEventListener('load', () => {
    let DBOpenRequest = indexedDB.open('SabzLearn', 26); // createing and updating

    DBOpenRequest.addEventListener('error', err => { // error 
        console.warn('Error', err)
    })

    DBOpenRequest.addEventListener('success', event => {  // successful operation
        db = event.target.result;
        getUsers()
        console.log('Success', event.target.result);
    })

    DBOpenRequest.addEventListener('upgradeneeded', (event) => { // upgrading database (version , ...)

        db = event.target.result;

        console.log('Old Version', event.oldVersion);
        console.log('upgrade', db);
        console.log('New Version', event.newVersion);

        if (!db.objectStoreNames.contains('users')) {   // creating new store if it does not already exist
            objectStore = db.createObjectStore('users', {
                keyPath: 'UserID'
            });
        //     console.log(objectStore)
        // }
        // if(!db.objectStoreNames.contains('courses')) {  
        //     db.createObjectStore('courses');
        // }
        // if (db.objectStoreNames.contains('courses')) {  //delete store if it already exists            objectStore = db.createObjectStore('users');
        //     db.deleteObjectStore('courses')
        // }
        // if (db.objectStoreNames.contains('users')) {  //delete store if it already exists            objectStore = db.createObjectStore('users');
        //     db.deleteObjectStore('users')
        // }

        console.log('objectStoresNames', db.objectStoreNames)  // strore names

    }
    })
})


registerForm.addEventListener('submit', event => {
    event.preventDefault();  // prevent from refreshing page

    let newUser = {
        UserID: Math.round(Math.random() * 9999),
        name: usernameInput.value,
        password: passwordInput.value,
        email: emailInput.value,
    }  // create new user 

    // let tx = db.transaction('users', 'readonly') // if we need to just read
    let tx = createTransaction('users', 'readwrite'); // if we need to change

    tx.addEventListener('error', (err) => {
        console.warn('Error', err);
    })
    tx.addEventListener('success', (event) => {
        console.log('Success', event);
    })

    let store = tx.objectStore('users'); // saving usersStore in store variable 
    let request = store.add(newUser) // sending a request to database for change store (add)
    

    request.addEventListener('error', (err) => {
        console.warn('Request Error', err);
    })
    request.addEventListener('success', (event) => {
        console.log('Request Success', event);
        clearAll();
    })
    getUsers()

})

function clearAll() {
    emailInput.value = ''
    usernameInput.value = ''
    passwordInput.value = ''
}

function getUsers() {
    let getTX = createTransaction('users', 'readonly');

    // getTX.addEventListener('error', (err) => {
    //     console.warn('getTX Error', err);
    // })
    // getTX.addEventListener('complete', (event) => {
    //     console.log('getTX Complete', event);
    // })

    let store = getTX.objectStore('users'); // saving usersStore in store variable 
    let request = store.getAll();

    request.addEventListener('error', (err) => {
        console.warn('Get request Error', err);
    })
    request.addEventListener('success', (event) => {
        console.log('Get request Success', event);
        let allUsers = event.target.result;
       mainList.innerHTML = allUsers.map(user => {
            return `<div class="list-item">
            <div class="id">${user.UserID}</div>
            <div class="name">${user.name}</div>
            <div class="email">${user.email}</div>
            <div class="password">${user.password}</div>
             </div>`
        }).join("");
        // console.log(usersTemplateArray);

    })
}

function createTransaction(storeName, mode) {
    let tx = db.transaction(storeName, mode);
    tx.addEventListener('error', err=> {
        console.warn('TX Error'  ,err);
    })
    tx.addEventListener('success', event=> {
        console.warn('TX success'  ,event);
    })
    return tx;
}
