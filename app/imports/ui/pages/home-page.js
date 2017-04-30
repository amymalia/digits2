import { Template } from 'meteor/templating';
import { Weather } from '../../api/weather/weather.js';
import { Meteor } from 'meteor/meteor';

function totalConsumption() {
  let t_consump = 0;
  const w = Weather.find().fetch()[0];

  for(var i = 0; i < w.devices.length; i ++)
  {
    t_consump+= w.devices[i].power;
  }
  return t_consump;
}

function totalProduction() {
    let t_prod = 0;
    const w = Weather.find().fetch()[0];
    const cloud_percent = parseFloat(w.clouds)/100.00;
    const p = (1 - (0.75 * (Math.pow(cloud_percent, 3))));
    const actual_radiation = p * parseFloat(w.radiation);

    t_prod = w.areaPanel * w.absorbPanel * actual_radiation;
    return t_prod;
}

//create a function to update storeEnergy every minute using totalconsumption/totalProduction
function energyTime() {
  //this will be in minutes
    let energy_left_min = 0;
    const w = Weather.find().fetch()[0];
    const stored = w.storedEnergy;
    energy_left_min = stored / (totalProduction() - totalConsumption())/60.00;
    return energy_left_min;
}

function


window.setInterval(function(){
    const storedEnergy += (totalProduction() - totalConsumption())/60.00;
    const w = Weather.find().fetch()[0];
    w.update(weather._id, {
      $set: {storedEnergy},
    });
    energyTime();
}, 60000);

Template.Home_Page.helpers({
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';
  },
  fieldError(fieldName) {
    const invalidKeys = Template.instance().context.invalidKeys();
    const errorObject = _.find(invalidKeys, (keyObj) => keyObj.name === fieldName);
    return errorObject && Template.instance().context.keyErrorMessage(errorObject.name);
  },
  /**
   * @returns {*} The location weather.
   */
  weather() {
    const w = Weather.find().fetch();
    return w[0];
  },
  total_energy() {
    const total_energy = totalProduction() - total_consumption();
    return total_energy;
  },

});

Template.Home_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Weather');
  });
});

Template.Home_Page.events({
  'submit .location-data'(event, instance) {
    event.preventDefault();
    // Get name (text field)
    const latitude = document.getElementById("latInput").value;
    const longitude = document.getElementById("longInput").value;
    Meteor.call('checkWeather', latitude, longitude);
    //Meteor.call('checkRadiation', latitude, longitude);
  },
  'submit .panel-data'(event, instance) {
    event.preventDefault();
    // Get name (text field)
    const areaPanel = document.getElementById("panelAreaInput").value;
    const absorbPanel = document.getElementById("panelAbsorbInput").value;
    const weathers = Weather.find().fetch();
    const weather = weathers[0];
    Weather.update(weather._id, {
     $set: { areaPanel, absorbPanel},
    });
    //Meteor.call('checkRadiation', latitude, longitude);
  },
});

Template.Home_Page.onRendered(function onRendered() {
  this.$('.ui.accordion').accordion();
});
