/**
 * Created by ataka on 10/16/16.
 */
import { Weather } from '../../api/weather/weather.js';
import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { check } from 'meteor/check';

Weather.publish();


Meteor.methods({
  checkWeather(latitude, longitude) {
    check(latitude, String);
    check(longitude, String);
    this.unblock();
    try {
      const response = HTTP.get(`http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&APPID=66d972806c94c7fdec001883887e3556`);
      const responseRadiation = HTTP.get(`https://developer.nrel.gov/api/pvwatts/v5.json?api_key=AlyMNtdT59V5xJq0rG52mYVUjPMf2uuLIQi7ScRI&lat=${latitude}&lon=${longitude}&system_capacity=4&azimuth=180&tilt=40&array_type=1&module_type=1&losses=10&timeframe=hourly`);
      const responseCloudFore = HTTP.get(`http://api.openweathermap.org/data/2.5/forecast/daily?lat=${latitude}&lon=${longitude}&cnt=10&appid=b1b15e88fa797225412429c1c50c122a1`);
      const radiationArray = responseRadiation.data.outputs.dn;
      const today = new Date();
      const first = new Date(today.getFullYear(), 0, 1);
      const theDay = Math.round(((today - first) / 1000 / 60 / 60 / 24) + .5, 0);
      const d = new Date();
      const n = d.getHours();
      const index = (theDay * 24) + n;
      //const for 6 days ahead
      let radiationForecast = [0,0,0,0,0,0];

      for (var j = 0; j < 6; j++) {
        for (var k = 0; k < 24; k++) {
          radiationForecast[j] += radiationArray[((theDay + j + 1) * 24) + k];
        }
        console.log('Radiation Forecast j ' + (radiationForecast[j]));
        radiationForecast[j] = Math.round((radiationForecast[j]));
      }

      let avgHourly = radiationArray[index];
      for(var i = 0; i < 480; i += 24)
      {
        avgHourly += radiationArray[index + i];
      }
      for(var i = 0; i > 480; i += 24)
      {
        avgHourly += radiationArray[index - i];
      }

      console.log('Radiation Forecast' + radiationForecast);

      console.log(radiationArray[index]);
      const description = response.data.weather[0].description;
      const temperature = response.data.main.temp;
      const windSpeed = response.data.wind.speed;
      const clouds = response.data.clouds.all;
      const name = response.data.name;
      const radiation = avgHourly;
      const devices = [{ name:'Lab', power:5000, time:0 },
        { name:'Small Device', power:330, time:0 },
        { name:'Large Device', power:35000, time:0 }];
      console.log(devices);
      const weather = { latitude, longitude, description, temperature, windSpeed, clouds, name, radiation, devices, radiationForecast };
      if (Weather.find().count() === 0) {
        Weather.define(weather);
      } else {
        const weathers = Weather.find().fetch();
        const weather = weathers[0];
        Weather.update(weather._id, {
          $set: { latitude, longitude, description, temperature, windSpeed, clouds, name, radiation, devices, radiationForecast },
        });
      }
      return weather;
    } catch (e) {
      // Got a network error, timeout, or HTTP error in the 400 or 500 range.
      return false;
    }
  },
  checkRadiation(latitude, longitude) {
    check(latitude, String);
    check(longitude, String);
    //this.unblock();
    console.log('hiiiii');
    try {
      const weathers = Weather.find().fetch();
      const weather = weathers[0];
      const response = HTTP.get(`https://developer.nrel.gov/api/pvwatts/v5.json?api_key=AlyMNtdT59V5xJq0rG52mYVUjPMf2uuLIQi7ScRI&lat=${latitude}&lon=${longitude}&system_capacity=4&azimuth=180&tilt=40&array_type=1&module_type=1&losses=10&timeframe=hourly`);
      const radiation = response.data.outputs.dn;
      const today = new Date();
      const first = new Date(today.getFullYear(), 0, 1);
      const theDay = Math.round(((today - first) / 1000 / 60 / 60 / 24) + .5, 0);
      const d = new Date();
      const n = d.getHours();
      const index = (theDay * 24) + n;
      console.log(radiation[index]);
      const newWeather = {
        description: weather.description,
        temperature: weather.temperature,
        windSpeed: weather.windSpeed,
        clouds: weather.clouds,
        name: weather.name,
        radiation: radiation[index],
      };
      Weather.remove({});
      Weather.insert(newWeather);
      console.log('hi');
      return true;
    } catch (e) {
      // Got a network error, timeout, or HTTP error in the 400 or 500 range.
      return false;
    }
  },
});
