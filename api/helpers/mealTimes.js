const moment = require('moment');

const createTime  = (time) =>{
    return moment.tz('America/New_York').startOf('day').add(time, 'hours')
}

const meals = [
    {Location: 'Sovi', Meal: 'Breakfast', Days: ['M', 'T', 'W', 'R', 'F'], StartTime: 7, EndTime: 10},
    {Location: 'Sovi', Meal: 'Lunch', Days: ['M', 'T', 'W', 'R', 'F'], StartTime: 10.5, EndTime: 14.5},   
    {Location: 'Sovi', Meal: 'Dinner', Days: ['M', 'T', 'W', 'R', 'F', 'S', 'U'], StartTime: 17, EndTime: 20.5},
    {Location: 'Sovi', Meal: 'Brunch', Days: ['S', 'U'], StartTime: 10.5, EndTime: 17},
    {Location: 'Crown', Meal: 'Breakfast', Days: ['M', 'T', 'W', 'R', 'F'], StartTime: 7, EndTime: 10.5},
    {Location: 'Crown', Meal: 'Lunch', Days: ['M', 'T', 'W', 'R', 'F'], StartTime: 10.5, EndTime: 17},
    {Location: 'Crown', Meal: 'Dinner', Days: ['M', 'T', 'W', 'R', 'F', 'S', 'U'], StartTime: 17, EndTime: 20.5},
    {Location: 'Crown', Meal: 'Brunch', Days: ['S', 'U'], StartTime: 10.5, EndTime: 14},
    {Location: 'Crown', Meal: 'Late Night', Days: ['M', 'T', 'W', 'R'], StartTime: 20.5, EndTime: 23.5}
];

const weekdayLookup = {
    0: 'U',
    1: 'M',
    2: 'T',
    3: 'W',
    4: 'R',
    5: 'F',
    6: 'S',
}

let mealTimes = {
    'Sovi': {},
    'Crown': {}
};

for(const day of ['M', 'T', 'W', 'R', 'F', 'S', 'U']){
    mealTimes['Sovi'][day] = [];
    mealTimes['Crown'][day] = [];
}

for(const meal of meals){
    for(const day of meal.Days){
        mealTimes[meal.Location][day].push({MealName: meal.Meal, StartTime: meal.StartTime, EndTime: meal.EndTime});
    }
}


module.exports = {
    getCurrentMealTime : async (location, currentTime) =>
    {
        let day = weekdayLookup[currentTime.day()];
        for(const mealTime of mealTimes[location][day]){
            const startTime = createTime(mealTime.StartTime);
            const endTime = createTime(mealTime.EndTime);
            if(currentTime.isBefore(endTime) && startTime.isBefore(currentTime)){
                return mealTime.MealName;
            }
        }
        return null;
    }
}