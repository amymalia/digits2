/**
 * Created by mike3 on 4/29/2017.
 */
import {Template} from 'meteor/templating';
import {Weather} from '../../api/weather/weather.js';
import {_} from 'meteor/underscore';

$(document).ready(function () {
  // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
  //$('.modal-trigger').leanModal();
  //$('.modal1').modal();

});

function totalConsumption() {
  let t_consump = 0;
  const w = Weather.find().fetch()[0];

  for (var i = 0; i < w.devices.length; i++) {
    let deviceTime = (w.devices[i].time) / 60;
    t_consump += (w.devices[i].power) * deviceTime;
  }
  return t_consump;
}

function totalProduction() {
  let t_prod = 0;
  const w = Weather.find().fetch()[0];
  const cloud_percent = parseFloat(w.clouds) / 100.00;
  const p = (1 - (0.75 * (Math.pow(cloud_percent, 3))));
  const actual_radiation = p * parseFloat(w.radiation);

  t_prod = w.areaPanel * w.absorbPanel * actual_radiation;
  return t_prod;
}

function moneyGenerated() {
  //dollars per hour from production
  const costPerKwh = 0.11;
  const posEnergyRate = costPerKwh * totalProduction();
  return posEnergyRate / 1000;
}

function moneyConsumed() {
  //dollars per hour from production
  const costPerKwh = 0.11;
  const posEnergyRate = costPerKwh * totalConsumption();
  return posEnergyRate / 1000;
}

function updateValue(newVal, deviceName) {
  console.log('Slider Value: ' + newVal);
  document.getElementById(deviceName).innerHTML = newVal;
}

Template.Electric_Consumption_Page.onCreated(function onCreated() {
  this.subscribe(Weather.getPublicationName());
});

Template.Electric_Consumption_Page.helpers({
  deviceButtons(device) {
    let buttons = '';
    for (let i = 0; i < device.time.length; i ++) {
      if (device.time[i] !== 0) {
        buttons += `<button id="${device.name}-${i}" class="ui teal button time">${i}</button> `;
      } else {
        buttons += `<button id="${device.name}-${i}" class="ui small compact basic grey button time">${i}</button> `;
      }
    }
    return buttons;
  },
  devices(){
    const w = Weather.find().fetch();
    console.log(w[0].devices);
    return w[0].devices;
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
    const difference = moneyConsumed() - moneyGenerated();
    if (difference < 0) {
      return 0;
    }
    return difference.toFixed(2);
  },
  hours(device) {
    let hours = 0;
    for (let i = 0; i < device.time.length; i++) {
      hours += device.time[i];
    }
    return `${hours} hours`;
  },
});

Template.Electric_Consumption_Page.events({
  'click .time'(event, instance) {
    event.preventDefault();
    // Get name (text field)
    const weathers = Weather.find().fetch();
    const weather = weathers[0];
    let newDevices = weather.devices;
    const id = event.currentTarget.id;
    let splitID = id.split('-');
    console.log(splitID[0]);
    for(let i = 0; i < newDevices.length; i++) {
      if (newDevices[i].name === splitID[0]) {
        newDevices[i].time[splitID[1]] = 1 - newDevices[i].time[splitID[1]];
      }
    }
    //let device = _.where(newDevices, { name: splitID[0] });
    //console.log(event.currentTarget.id);
    //console.log(_.where(newDevices, { name: splitID[0] }));
    //swaps between 1 and 0
    //device.time[splitID[1]] = 1 - device.time[splitID[1]];
    console.log(newDevices);
    Weather.update(weather._id, {
      $set: { devices: newDevices },
    });
  },
});
