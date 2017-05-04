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
      const responseCloud = HTTP.get(`http://api.openweathermap.org/data/2.5/forecast/daily?lat=${latitude}&lon=${longitude}&cnt=6&appid=88d03a4d7244e5109c19a4f7c52e4ff3`);
      const responseHourlyCloud = HTTP.get(`http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=87b31365cfb97843b11097922667529f`);
      const radiationArray = responseRadiation.data.outputs.dn;
      const today = new Date();
      const first = new Date(today.getFullYear(), 0, 1);
      const theDay = Math.round(((today - first) / 1000 / 60 / 60 / 24) + .5, 0);
      const d = new Date();
      const n = d.getHours();
      const index = (theDay * 24) + n;
      //const for 6 days ahead
      let radiationForecast = [0,0,0,0,0,0];

      //total radiation per day for next 6 days
      for (var j = 0; j < 6; j++) {
        for (var k = 0; k < 24; k++) {
          radiationForecast[j] += radiationArray[((theDay + j + 1) * 24) + k];
        }

        console.log('Radiation Forecast j ' + (radiationForecast[j]));
        radiationForecast[j] = Math.round((radiationForecast[j]));
      }

      //gets average at hour across 40 days
      let avgHourly = radiationArray[index];
      for(var i = 0; i < 480; i += 24)
      {
        avgHourly += radiationArray[index + i];
      }
      for(var i = 0; i > 480; i += 24)
      {
        avgHourly += radiationArray[index - i];
      }
      avgHourly = avgHourly/40;

      //hourly radiation
      let hourlyRadiation = [];
      for(let i = 0; i < 24; i++)
      {

      }
      //console.log('Radiation Forecast' + radiationForecast);
      //console.log(radiationArray[index]);

      //average cloud coverage for the day for 6 days
      let cloudForecast = [0, 0, 0, 0, 0, 0];
      for(var i = 0; i < 6; i++)
      {
          console.log(responseCloud.data.list[i].clouds);
          cloudForecast[i] = responseCloud.data.list[i].clouds;
      }
      console.log('Cloud Forecast ' + cloudForecast);


      //cloud coverage for every 3 hours for 24 hours
      let hourlyClouds = [];
      for( let i = 0; i < 8; i++)
      {
        let cTime = responseHourlyCloud.data.list[i].dt_txt;
        console.log(cTime);
        hourlyClouds[i] = {time: cTime.substring(cTime.length - 8, cTime.length - 6), clouds: responseHourlyCloud.data.list[i].clouds.all};
      }
      console.log('hourly cloud: ' + hourlyClouds);


      const description = response.data.weather[0].description;
      const temperature = response.data.main.temp;
      const windSpeed = response.data.wind.speed;
      const clouds = response.data.clouds.all;
      const name = response.data.name;
      const radiation = avgHourly;
      const weather = { latitude, longitude, description, temperature, windSpeed, clouds, name, radiation, radiationForecast, cloudForecast, hourlyClouds};
      if (Weather.find().count() === 0) {
        Weather.define(weather);
      } else {
        const weathers = Weather.find().fetch();
        const weather = weathers[0];
        Weather.update(weather._id, {
          $set: { latitude, longitude, description, temperature, windSpeed, clouds, name, radiation, devices, radiationForecast, cloudForecast, hourlyClouds},
        });
      }
      return weather;
    } catch (e) {
      // Got a network error, timeout, or HTTP error in the 400 or 500 range.
      return false;
    }
  },
});
