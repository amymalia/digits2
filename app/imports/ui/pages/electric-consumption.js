/**
 * Created by mike3 on 4/29/2017.
 */
import { Template } from 'meteor/templating';
import { Weather } from '../../api/weather/weather.js';

$(document).ready(function(){
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    //$('.modal-trigger').leanModal();
    //$('.modal1').modal();

});


function totalConsumption() {
  let t_consump = 0;
  const w = Weather.find().fetch()[0];

  for(var i = 0; i < w.devices.length; i ++)
  {
    let deviceTime = (w.devices[i].time)/60;
    t_consump+= (w.devices[i].power) * deviceTime;
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

function moneyGenerated() {
  //dollars per hour from production
  const costPerKwh = 0.11;
  const posEnergyRate = costPerKwh * totalProduction();
  return posEnergyRate/1000;
}

function moneyConsumed() {
  //dollars per hour from production
  const costPerKwh = 0.11;
  const posEnergyRate = costPerKwh * totalConsumption();
  return posEnergyRate/1000;
}

function updateValue(newVal, deviceName) {
  console.log('Slider Value: ' + newVal);
  document.getElementById(deviceName).innerHTML = newVal;
}

Template.Electric_Consumption_Page.onCreated(function onCreated() {
  this.subscribe(Weather.getPublicationName());
});

Template.Electric_Consumption_Page.onRendered(function onRendered() {
   // $(document).ready(function(){
        // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
     //   $('.modal').modal();
    //});
});
//name
//time--> minutes
//power usage
//let device1 = {"Lab", 60, 2000};
//let device2 = {"Small Appliance", 90, 500};
//let device3 = {"Large Appliance", 30, 1000};

Template.Electric_Consumption_Page.helpers({
    devices(){
      const w = Weather.find().fetch();
      console.log(w[0].devices);
      return w[0].devices;
    },
  updateValue(newVal, deviceName) {
    console.log('Slider Value: ' + newVal);
    //document.getElementById(deviceName).innerHTML = newVal;
  },
  rawCost() {
    return moneyConsumed().toFixed(2);
  },
  saved() {
    if (moneyGenerated() > moneyConsumed()) {
      return moneyConsumed().toFixed(2);
    }
    return moneyGenerated().toFixed(2);
  },
  finalCost() {
    const difference = moneyConsumed()-moneyGenerated();
    if (difference < 0) {
      return 0;
    }
    return difference.toFixed(2);
  },
  getTime(device) {
    console.log('Time is ' + device.time);
    return device.time;
  },
  hours(minutes) {
    const hours = Math.floor(minutes/60);
    const min = minutes - (60 * hours);
    return `${hours} hours and ${min} minutes`;
  },
});

Template.Electric_Consumption_Page.events({
  'input .device-sliders'(event, instance) {
    event.preventDefault();
    // Get name (text field)
    const weathers = Weather.find().fetch();
    const weather = weathers[0];
    let newDevices = weather.devices;

    console.log(weather.devices);
    for (i=0; i < weather.devices.length; i++) {
      console.log('value: ' + document.getElementById(`${weather.devices[i].name}-slider`).value);
      newDevices[i].time = document.getElementById(`${weather.devices[i].name}-slider`).value;
    }
    Weather.update(weather._id, {
      $set: { devices: newDevices },
    });
  },
});
