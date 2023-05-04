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
        console.warn('Error', err);
    })

    DBOpenRequest.addEventListener('success', event => {
        db = event.target.result
        getUsers()
        console.log('Success', event);
    })

    DBOpenRequest.addEventListener('upgradeneeded', (event) => {
        db = event.target.result;

        console.log('Old Version', event.oldVersion);
        console.log(db);
        console.log('New Version', event.newVersion);

        if (!db.objectStoreNames.contains('users')) {
            objectStore = db.createObjectStore('users', {
                keyPath: 'UserID'
            })
            console.log(objectStore);
        }

        console.log('objecStoreNAmes', db.objectStoreNames);
    })
})

formRegister.addEventListener('submit', event => {
    event.preventDefault();

    let newUser = {
        UserID: Math.round(Math.random() * 9999),
        Username: usernameInput.value,
        Password: passwordInput.value,
        Email: emailInput.value,
    }

    let usersTransaction = TransactionCreator('users', 'readwrite');

    // usersTransaction.addEventListener('error', err => {
    //     console.warn('Transaction Error', err);
    // })

    // usersTransaction.addEventListener('success', event => {
    //     console.log('Transaction Success', event);
    // })

    let store = usersTransaction.objectStore('users');
    let request = store.add(newUser);


    request.addEventListener('error', err => {
        console.warn('Request Error', err);
    })

    request.addEventListener('success', event => {
        console.log('Request Success', event);
        clearAllInputs();
        getUsers();
    })

})

function clearAllInputs() {
    usernameInput.value = ""
    passwordInput.value = ""
    emailInput.value = ""
}

function getUsers() {
    let getTransaction = TransactionCreator('users', 'readonly');

    getTransaction.addEventListener('complete', event => {
        console.log('Complete', event)
    })

    let storeContent = getTransaction.objectStore('users');
    let requestContent = storeContent.getAll();
    requestContent.addEventListener('error', err => {
        console.warn('RequestContent Error', err);
    })

    requestContent.addEventListener('success', event => {
        console.log('RequestContent Success', event);
        let allUsers = event.target.result;
        mainList.innerHTML = allUsers.map(user => {
            return `<div class="list-item">
            <div class="id">${user.UserID}</div>
            <div class="name">${user.Username}</div>
            <div class="email">${user.Email}</div>
            <div class="password">${user.Password}</div>
            <div class="action"><a href="#" onclick="removeUser(${user.UserID}, event)">Remove</a></div>
        </div>`
        }).join('')
    })


}

function TransactionCreator(storeName, mode) {
    let transact = db.transaction(storeName, mode);
    transact.addEventListener('error', err => {
        console.warn('Transaction Error', err);
    })

    transact.addEventListener('success', event => {
        console.log('Transaction Success', event);
    })
    return transact;
}

function removeUser(userID, event) {
    event.preventDefault();
    let removeTransaction = TransactionCreator('users', 'readwrite');

    removeTransaction.addEventListener('complete', event => {
        console.log('Delete TX Complete', event)
    })

    let removeStore = removeTransaction.objectStore('users');
    let removeRequest = removeStore.delete(userID);

    removeRequest .addEventListener('error', err => {
        console.warn('Delete Request  Error', err);
    })

    removeRequest .addEventListener('success', event => {
        console.log('Delete Request Success', event);
        getUsers();
    })
}