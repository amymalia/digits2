import { Template } from 'meteor/templating';
import { Weather } from '../../api/weather/weather.js';
import { Meteor } from 'meteor/meteor';
import { Chart } from 'chart.js';


function hourlyConsumption() {
  let t_consump = 0;
  const w = Weather.find().fetch()[0];

  for(var i = 0; i < w.devices.length; i ++)
  {
    let deviceTime = (w.devices[i].time)/60;
    t_consump+= (w.devices[i].power) * deviceTime;
  }
  return t_consump;
}

function hourlyProduction() {
  let t_prod = 0;
  const w = Weather.find().fetch()[0];
  const cloud_percent = parseFloat(w.clouds)/100.00;
  const p = (1 - (0.75 * (Math.pow(cloud_percent, 3))));
  const actual_radiation = p * parseFloat(w.radiation);

  t_prod = w.areaPanel * w.absorbPanel * actual_radiation;
  return t_prod;
}

function avgMoneyGenerated() {
  //dollars per hour from average rate after production - consumption
  const costPerKwh = 0.11;
  const avgEnergyRate = costPerKwh * (hourlyProduction() - hourlyConsumption());
  return avgEnergyRate;
}
function moneyGenerated() {
  //dollars per hour from production
  const costPerKwh = 0.11;
  const posEnergyRate = costPerKwh * hourlyProduction();
  return (posEnergyRate)/1000;
}

function moneyConsumed() {
  //dollars per hour from production
  const costPerKwh = 0.11;
  const posEnergyRate = costPerKwh * hourlyConsumption();
  return (posEnergyRate)/1000;
}

//create a function to update storeEnergy every minute using totalConsumption/totalProduction
function energyTime() {
  //this will be how many minutes of current usage left
  let energy_left_min = 0;
  const w = Weather.find().fetch()[0];
  const stored = w.storedEnergy;
  energy_left_min = stored / (hourlyProduction() - hourlyConsumption())/60.00;
  return energy_left_min;
}

function xaxis() {
  let d = new Date();
  let h = d.getHours();
  let labels = [];
  let hour = h;
  for (let i = h; i < 24; i ++) {
    labels.push(h)
    if (h === 23) {
      h = 0;
    } else {
      h += 1;
    }
  }
  return labels;
}

/*window.setInterval(function(){
  let storedEnergy = 0;
  storedEnergy += (totalProduction() - totalConsumption())/60.00;
  const w = Weather.find().fetch()[0];
  w.update(weather._id, {
    $set: {storedEnergy},
  });
  energyTime();
}, 60000);
*/

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
    console.log(w[0].devices);
    return w[0];
  },
  barRatio() {
    if (hourlyProduction() === 0) {
      return 0;
    } else if (totalConsumption() === 0) {
      return 100;
    } else {
      const totalEnergy = hourlyProduction() - hourlyConsumption();
      console.log('total consumption: ' + hourlyConsumption());
      console.log('total production: ' + hourlyProduction());
      console.log('total energy: ' + totalEnergy);
      console.log('ratio: ' + (hourlyProduction()/totalEnergy)*100);
      return (hourlyProduction()/hourlyConsumption())*100;
    }
  },
  efficiency() {
    const w_temp = Weather.find().fetch();
    const w = w_temp[0];
    const cloud_percent = parseFloat(w.clouds)/100.00;
    // const day = dayofYear(new Date());
    // const rad_ind = parseInt(day)*24;
    const p = (1 - (0.75 * (Math.pow(cloud_percent, 3))));
    const actual_radiation = p * parseFloat(w.radiation);
    // get from ui total_consumption per hour
    let total_consumption = 500;
    // get panelEff from ui
    let panelEff = .20;
    // assign total_consumption or return it

    // get panel size from ui
    const panelSize = 8;
    const total_energy = actual_radiation*panelSize*panelEff - total_consumption;
    console.log('cloud: ' + cloud_percent);
    console.log('p: ' + p);
    console.log('actual rad: ' + actual_radiation);
    console.log('actual rad * panel size * panel eff: '+ actual_radiation*panelSize*panelEff);
    console.log('total energy: ' + total_energy);
    return total_energy;
  },
  totalConsumptionHelper() {
    const difference = Math.round((hourlyConsumption() - hourlyProduction())/1000);
    if (difference < 0) {
      return 0;
    }
    return difference;
  },
  hourlyProductionHelper() {
    return Math.round(hourlyProduction()/1000);
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
});

Template.Home_Page.onCreated(function onCreated() {
    this.subscribe(Weather.getPublicationName());
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
    const battery = document.getElementById("batteryInput").value;
    const weathers = Weather.find().fetch();
    const weather = weathers[0];
    Weather.update(weather._id, {
     $set: { areaPanel, absorbPanel, battery},
    });
    //Meteor.call('checkRadiation', latitude, longitude);
  },
});

Template.Home_Page.onRendered(function onRendered() {
  this.$('.ui.accordion').accordion();
});
