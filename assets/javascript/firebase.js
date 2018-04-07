$(document).ready(function () {
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
	$("#signInBtn").on("click", (event) => {
		event.preventDefault();
		var email = $("#loginEmail").val().trim();
		var pass = $("#loginPassword").val().trim();
		var auth = firebase.auth();
		var loginPromise = auth.signInWithEmailAndPassword(email, pass);
		loginPromise.catch( e => $("#wrongLogin").css("visibility","visible").html("Please enter a valid email and password."));
	});
	
	// Have user create account, PLEASE NOTE!!! There is a bug in Chrome where you will get an error message that says:
	// "The 'Access-Control-Allow-Origin' header has a value 'null' that is not equal to the supplied origin. Origin 'null' is therefore not allowed access."
	// the user data will still be added to the database and it will work fine on other browsers
	$("#createAccountBtn").on("click", (event) => {
		event.preventDefault();
		var email = $("#loginEmail").val().trim();
		var pass = $("#loginPassword").val().trim();
		// makes sure email has both a "@" and a "." and that the password has one number, lowercase letter, uppercase letter, and be 8 char long
		if (/\S+@\S+\.\S+/.test(email) === true && /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(pass) === true) {
			var auth = firebase.auth();
			var loginPromise = auth.createUserWithEmailAndPassword(email, pass);
			loginPromise.catch( e => console.log(e.message));  
		} else {
			//$('#loginModal').modal('show');
			$("#wrongLogin").css("visibility","visible").html("Please enter a valid email, password must have capital letter lowercase letter and a number");
			$("#loginEmail").val("");
			$("#loginPassword").val("");
		} 
	});
	
	// Logs user out
	$("#logoutBtn").on("click", (event) => {
		event.preventDefault();
		firebase.auth().signOut();
	});
	
	// Listens for user login and returns the user information as a object
	firebase.auth().onAuthStateChanged(firebaseUser => { 
		if(firebaseUser) {
			// hide all buttons when logged in
			$("#wrongLogin").css("visibility","hidden");
			$("#loginEmail").hide();
			$("#loginPassword").hide();
			$("#signInBtn").hide();
			$("#createAccountBtn").hide();
			$("#logoutBtn").show();
			$("#winnerNickname").show();
			$("#saveWinnerData").show();

			// grabs the user info on sign in and gets the user's username from the JSON
			userInfo = firebaseUser;
			userLoginID = userInfo.uid;

		} else {
			// hide the logout button by default
			$("#wrongLogin").css("visibility","hidden");
			$("#loginEmail").val("");
			$("#loginPassword").val("");
			$("#loginEmail").show();
			$("#loginPassword").show();
			$("#signInBtn").show();
			$("#createAccountBtn").show();
			$("#logoutBtn").hide();
			$("#winnerNickname").hide();
			$("#saveWinnerData").hide();
		}
	});
	
	// grabs test data that the user puts in the database
	$("#saveWinnerData").on("click", (event) => {
		event.preventDefault();
		// grab user input data. Firebase stores data as a string by default so the score needs to be inside a parseInt to store as a number
		var nickname = $("#winnerNickname").val(); 
		var winnerScore = numberOfClicks;
		// parseInt($();
		// put user input in object then push it to the database
		var newTest = {
			user_name: nickname, 
			high_score: winnerScore,
			score_date: currentDate
		}; 
		// push data to the database
		database.ref(userLoginID).update(newTest);
		$('#winModal').modal('hide');
		$("#winnerNickname").val("");
	});
	
	// pull data from firebase and orders it by high score with smallest number to highest number, them only pulls the first 10
	databaseRef.orderByChild("high_score").limitToFirst(10).on("child_added", (childSnapshot, prevChildKey) => {
		// grab all the user information currently in firebase
		var nicknameInputData = childSnapshot.val().user_name;  
		var scoreInputData = childSnapshot.val().high_score;
		var dateInputData = childSnapshot.val().score_date;
		// write data to the table
		$("#scoreTable > tbody").append("<tr><td>" + nicknameInputData + "</td><td>" + scoreInputData + "</td><td>" +  dateInputData + "</td></tr>");
	});
});