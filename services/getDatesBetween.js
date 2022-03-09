function getDatesBetween(startingDate, endingDate) { //return array with dates from startingdate to endingdate
    var dateArray = new Array();
    var currentDate = startingDate;

    while (currentDate <= endingDate) {

        dateArray.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
        
    }

    return dateArray;
}

export default getDatesBetween;