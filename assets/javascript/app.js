// Initialize Firebase
var config = {
    apiKey: "AIzaSyDrNfuktkSP6MYaqLv8PhE39XZ94DYTPDk",
    authDomain: "employeedata-d3e00.firebaseapp.com",
    databaseURL: "https://employeedata-d3e00.firebaseio.com",
    projectId: "employeedata-d3e00",
    storageBucket: "employeedata-d3e00.appspot.com",
    messagingSenderId: "631641054485"
};
firebase.initializeApp(config);

// Set the database to a variable
let database = firebase.database();

// Initialize global variables
let name;
let destination;
let time;
let frequency;
let numberOfTrains;

// Display the current time
$("#currentTime").html(moment().format("HH:mm:ss"));

// When he page loads calculate the number of trains in the database
database.ref().on("value", function (snapshot) {
    numberOfTrains = snapshot.numChildren();
});

// When a train is added, run this function to calculate when it will arrive next and add it to the table
database.ref().on("child_added", function (childSnap) {
    // Grab the start time from the train and convert it to a readable time
    let convertedTime = moment(childSnap.val().time, "HH:mm");
    let currentTime = moment();

    // Calculate the difference of the current time and the start time in minutes
    let timeDiff = currentTime.diff(convertedTime, "minutes");
    let timeUntilTrain;
    let nextTrainTime;
    let timeRemainder;

    // If the difference is negative, then the train starts later in the day
    if (timeDiff < 0) {

        // The train starts in the absolute value of the difference plus one.
        timeUntilTrain = Math.abs(timeDiff) + 1;
        // Use the train's start time as the next time it arrives
        nextTrainTime = convertedTime.format("HH:mm");
    }

    // Otherwise the train has been running and calculate when it will arrive next.
    else {

        timeRemainder = timeDiff % childSnap.val().frequency;
        timeUntilTrain = childSnap.val().frequency - timeRemainder;
        nextTrainTime = currentTime.add(timeUntilTrain, "minutes").format("HH:mm");
    }
    
    // Create a new row in the html table and append the values to it
    let newRow = $("<tr>").append(
        $("<td>").html(childSnap.val().name),
        $("<td>").html(childSnap.val().destination),
        $("<td>").html(`${childSnap.val().frequency} minutes`),
        $("<td>").html(nextTrainTime),
        $("<td>").html(timeUntilTrain),

        // Assign the row a number used to update the row
    ).attr({
        id: childSnap.val().trainNumber,
    });

    // Append the row to the body
    $("#tableBody").append(newRow);



});

// When you click the submit button, grab the values from the form and create a new train in the database
$("#submitButton").on("click", function (event) {
    event.preventDefault();

    name = $("#nameInput").val().trim();
    destination = $("#destinationInput").val().trim();
    time = $("#timeInput").val().trim();
    frequency = parseInt($("#frequencyInput").val().trim());

    database.ref().push({
        name: name,
        destination: destination,
        time: time,
        frequency: frequency,
        trainNumber: numberOfTrains + 1,
    });
});

// Update the table every second so that times update after every minute passes
let updateSchedule = setInterval(function () {
    // Update current time
    $("#currentTime").html(moment().format("HH:mm:ss"));

    // Reference everything in the the database and iterate through the children
    database.ref().once("value")
        .then(function (snap) {
            snap.forEach(function (childSnap) {

                let convertedTime = moment(childSnap.val().time, "HH:mm");
                let currentTime = moment();

                let timeDiff = currentTime.diff(convertedTime, "minutes");
                let timeUntilTrain;
                let nextTrainTime;
                let timeRemainder;

                if (timeDiff < 0) {

                    timeUntilTrain = Math.abs(timeDiff) + 1;
                    nextTrainTime = convertedTime.format("HH:mm");
                }
                else {

                    timeRemainder = timeDiff % childSnap.val().frequency;
                    timeUntilTrain = childSnap.val().frequency - timeRemainder;
                    nextTrainTime = currentTime.add(timeUntilTrain, "minutes").format("HH:mm");
                }

                $(`#${childSnap.val().trainNumber}`).empty();
                $(`#${childSnap.val().trainNumber}`).append(
                    $("<td>").html(childSnap.val().name),
                    $("<td>").html(childSnap.val().destination),
                    $("<td>").html(`${childSnap.val().frequency} minutes`),
                    $("<td>").html(nextTrainTime),
                    $("<td>").html(timeUntilTrain),
                );
            })
        })
}, 1000);