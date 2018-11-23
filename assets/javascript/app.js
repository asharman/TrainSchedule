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

let database = firebase.database();

let name;
let destination;
let time;
let frequency;
let numberOfTrains;

$("#currentTime").html(moment().format("HH:mm:ss"));

database.ref().on("value", function (snapshot) {
    numberOfTrains = snapshot.numChildren();
});

database.ref().on("child_added", function (childSnap) {
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
    

    let newRow = $("<tr>").append(
        $("<td>").html(childSnap.val().name),
        $("<td>").html(childSnap.val().destination),
        $("<td>").html(`${childSnap.val().frequency} minutes`),
        $("<td>").html(nextTrainTime),
        $("<td>").html(timeUntilTrain),

    ).attr({
        id: childSnap.val().trainNumber,
    });
    $("#tableBody").append(newRow);



});

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

let updateSchedule = setInterval(function () {
    $("#currentTime").html(moment().format("HH:mm:ss"));

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