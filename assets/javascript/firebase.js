// Initialize Firebase
var config = {
	apiKey: "AIzaSyB6qNaVWSr2BrEKebnL9W-2q3xcfsZxU8k",
	authDomain: "minesweeper-high-scores.firebaseapp.com",
	databaseURL: "https://minesweeper-high-scores.firebaseio.com",
	projectId: "minesweeper-high-scores",
	storageBucket: "minesweeper-high-scores.appspot.com",
	messagingSenderId: "124529368660"
};

firebase.initializeApp(config);

// make vars for the database and the nodes the data will be stored in
var database = firebase.database();
var databaseRef = database.ref();
var userInfo;
var userLoginID;
var currentDate = moment().format("MMMM Do YYYY");

// Have user log in, PLEASE NOTE!!! There is a bug in Chrome where you will get an error message that says:
// "The 'Access-Control-Allow-Origin' header has a value 'null' that is not equal to the supplied origin. Origin 'null' is therefore not allowed access."
// it will work fine on other browsers
$("#login-fb").on("click", (event) => {
	event.preventDefault();
	var email = $("#login-username").val().trim();
	var pass = $("#login-password").val().trim();
	var auth = firebase.auth();
	var loginPromise = auth.signInWithEmailAndPassword(email, pass);
	loginPromise.catch( e => console.log(e.message));
});

// Have user create account, PLEASE NOTE!!! There is a bug in Chrome where you will get an error message that says:
// "The 'Access-Control-Allow-Origin' header has a value 'null' that is not equal to the supplied origin. Origin 'null' is therefore not allowed access."
// the user data will still be added to the database and it will work fine on other browsers
$("#create-account-fb").on("click", (event) => {
	event.preventDefault();
	// TODO: create if statement that makes sure that the user typed in a username, email, and password
	var email = $("#login-username").val().trim();
	var pass = $("#login-password").val().trim();
	var auth = firebase.auth();
	var loginPromise = auth.createUserWithEmailAndPassword(email, pass);
	loginPromise.catch( e => console.log(e.message));             
});

// Logs user out
$("#logout-fb").on("click", (event) => {
	event.preventDefault();
	firebase.auth().signOut();
});

// Listens for user login and returns the user information as a object
firebase.auth().onAuthStateChanged(firebaseUser => { 
	if(firebaseUser) {
		console.log("Logged In Successfully");
		console.log(firebaseUser);
		// grabs the user info on sign in and gets the user's username from the JSON
		userInfo = firebaseUser;
		userLoginID = userInfo.uid;
		console.log(userLoginID);
		// TODO: add logic to show logout btn
	} else {
		console.log("Not Logged In");
		// TODO: add logic to hide logout btn
	}
});

// grabs test data that the user puts in the database
$("#test-fb").on("click", (event) => {
	event.preventDefault();
	// grab user input data. Firebase stores data as a string by default so the score needs to be inside a parseInt to store as a number
	var username = $("#test-input").val(); 
	var testScore = parseInt($("#test-score").val());
	// put user input in object then push it to the database
	var newTest = {
		user_name: username, 
		high_score: testScore,
		score_date: currentDate
	}; 

	// push data to the database
	database.ref(userLoginID).update(newTest);

	// clear text boxes
	$("#test-input").val("");
});

// pull data from firebase and orders it by high score with smallest number to highest number, them only pulls the first 10
databaseRef.orderByChild("high_score").limitToFirst(10).on("child_added", (childSnapshot, prevChildKey) => {
	// grab all the user information currently in firebase
	var usernameInputData = childSnapshot.val().user_name;  
	var scoreInputData = childSnapshot.val().high_score;
	var dateInputData = childSnapshot.val().score_date;
	// write data to the table
	$("#table1 > tbody").append("<tr><td>" + usernameInputData + "</td><td>" + scoreInputData + "</td><td>" +  dateInputData + "</td></tr>");
});