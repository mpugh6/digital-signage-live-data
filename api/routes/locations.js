const express = require('express');
const router = express.Router();
const request = require('request');
const momentTimezone = require('moment-timezone');
const moment = require('moment');
const mealTimes = require('../helpers/mealTimes');
const parser = require('../helpers/parser');
const lookups = require('../helpers/lookups');
require("dotenv").config();

router.get('/', async (req, res, next) => {
    const testRoute = {
        url:  `${process.env.COMPASS_BASE_URI}businessunit/${process.env.BUSINESS_UNIT_ID || '12735'}/locations`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'X-IBM-Client-Id': process.env.IBM_CLIENT_ID,
            'client_id': process.env.CLIENT_ID
        }
    }
    request(testRoute, function(err, response, body) {  
        let json = JSON.parse(body);
        res.status(200).json(json);
    });
});

router.get('/:locationId/stations/:stationId', async (req, res, next) => {
    const locationId = req.params.locationId;
    const stationId = req.params.stationId;

    const currentTime = moment().tz('America/New_York');
    let diningHall;
    if(lookups.locations.hasOwnProperty(locationId))
        diningHall = lookups.locations[locationId];
    else    
        return res.status(500).json({message: 'Invalid location.'});

    const currentMealTime = await mealTimes.getCurrentMealTime(diningHall, currentTime);
    console.log(currentMealTime);
    formattedDate = currentTime.format();
    console.log(formattedDate);
    if(currentMealTime === null)
        return res.status(500).json({message: 'No current meal time.'});
    
    const route = {
        url:  `${process.env.COMPASS_BASE_URI}businessunit/${process.env.BUSINESS_UNIT_ID || '12735'}/menuitems?LocationId=${locationId}&StartDate=${formattedDate}&Days=1`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'X-IBM-Client-Id': process.env.IBM_CLIENT_ID,
            'client_id': process.env.CLIENT_ID
        }
    };
    console.log(route);
    request(route, async (err, response, body) => {  
        let jsonBody = JSON.parse(body);
        var items = [];
        for(const item of jsonBody){
            if(item.StationId == stationId){
                items.push({ Name: item.Name, Description: item.Description, Portion: item.Portion, Allergens: item.Allergens });
            }
        }
        res.status(200).json(items);
    });
});

router.get('/dineoncampus/', (req, res, next) => {
    request('https://api.dineoncampus.com/v1/locations/all_locations?site_id=5751fd2790975b60e0489226&platform=0', { json: true }, (err, response, body)=>{
        if(err) {return console.log(err);}
        let promises = body.locations.map((loc) =>{
            return {Id: loc.id, Name: loc.name};
        });
        Promise.all(promises).then((locations) => {
            res.status(200).json(locations);
        });
    });
});

router.get('/dineoncampus/:locationName', async (req, res, next) => {
    const locationName = req.params.locationName;
    const locationId = lookups.locations[locationName];
    
    const currentTime = momentTimezone().tz('America/New_York');
    const currentMealTime = mealTimes.getCurrentMealTime('Crown', currentTime);
    formattedDate = currentTime.format();
    
    if(currentMealTime === null){
        return res.status(500).json({message: 'No current meal time.'})
    }
    const url = `https://api.dineoncampus.com/v1/location/menu?site_id=5751fd2790975b60e0489226&platform=0&location_id=${locationId}&date=${formattedDate}`;
    
    request(url, { json: true }, async (err, response, body)=>{
        if(err) {return console.log(err);}
        if(!body.hasOwnProperty('menu'))
            return res.status(500).json({message: 'Location Id does not exist.'});

        const locations = await parser.getStations(body.menu.periods, currentMealTime);
        res.status(200).json(locations);
    });
});

router.get('/dineoncampus/:locationName/Stations/:stationName', async (req, res, next) => {
    const locationName = req.params.locationName;
    const stationName = req.params.stationName;
    const locationId = lookups.locations[locationName];

    const currentTime = momentTimezone().tz('America/New_York');
    const currentMealTime = mealTimes.getCurrentMealTime(locationName, currentTime);
    formattedDate = currentTime.format();

    if(currentMealTime === null)
        return res.status(500).json({message: 'No current meal time.'});
    
    const url = `https://api.dineoncampus.com/v1/location/menu?site_id=5751fd2790975b60e0489226&platform=0&location_id=${locationId}&date=${formattedDate}`;
    
    request(url, { json: true }, async (err, response, body)=>{
        if(err) {return console.log(err);}
        if(!body.hasOwnProperty('menu'))
            return res.status(500).json({message: 'Location Id does not exist.'});

        const menu = await parser.getStationMenu(body.menu.periods, currentMealTime, stationName);
        res.status(200).json(menu);
    });
});

module.exports = router; 