/**
 * Created by ataka on 10/16/16.
 */
import { Weather } from '../../api/weather/weather.js';
import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { check } from 'meteor/check';

Meteor.publish('Weather', function publishWeather() {
  return Weather.find();
});

Meteor.methods({
  checkWeather(latitude, longitude) {
    check(latitude, String);
    check(longitude, String);
    this.unblock();
    try {
      const response = HTTP.get(`http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&APPID=66d972806c94c7fdec001883887e3556`);
      const weather = {
        description: response.data.weather[0].description,
        temperature: response.data.main.temp,
        windSpeed: response.data.wind.speed,
        clouds: response.data.clouds.all,
        name: response.data.name,
        radiation: {},
      };
      Weather.remove({});
      Weather.insert(weather);
      return weather;
    } catch (e) {
      // Got a network error, timeout, or HTTP error in the 400 or 500 range.
      return false;
    }
  },
  checkRadiation(latitude, longitude) {
    check(latitude, String);
    check(longitude, String);
    this.unblock();
    console.log('hiiiii');
    try {
      const weather = Weather.find().fetch();
      const response = HTTP.get(`https://developer.nrel.gov/api/pvwatts/v5.json?api_key=AlyMNtdT59V5xJq0rG52mYVUjPMf2uuLIQi7ScRI&lat=${latitude}&lon=${longitude}&system_capacity=4&azimuth=180&tilt=40&array_type=1&module_type=1&losses=10&timeframe=hourly`);
      const radiation = response.dn;
      console.log('hi');
      console.log(response);
      Weather.update(weather[0]._id, radiation);
      return true;
    } catch (e) {
      // Got a network error, timeout, or HTTP error in the 400 or 500 range.
      return false;
    }
  },
});
