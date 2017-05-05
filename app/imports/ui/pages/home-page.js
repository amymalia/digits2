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
  //console.log(t_prod);
  return t_prod;
}

function batteryGraph() {
  let prodArr = productionGraph();
  let conArr = consumptionGraph();
  let batArr = [];
  const w = Weather.find().fetch()[0];
  let storedEnergy = parseFloat(w.storedEnergy);
  let batteryCapacity = parseFloat(w.battery);

  for(let i = 0; i < 24; i++)
  {
    batArr[i] = 0;
  }

  for(let i = 0; i < 24; i++)
  {
    if(prodArr[i] > conArr[i])
    {
      if(storedEnergy >= batteryCapacity)
      {
        console.log('sell back to grid');
        batArr[i] = prodArr[i] + batteryCapacity;
      }
      else
      {
        storedEnergy += prodArr[i] - conArr[i];
        if(storedEnergy >= batteryCapacity)
        {
          storedEnergy = batteryCapacity;
        }
        batArr[i] = prodArr[i] + storedEnergy;

        //Weather.update(w._id, {
        //    $set: {storedEnergy}
        //});
      }

    }
    else
    {
      if( storedEnergy <= 0)
      {
        batArr[i] = prodArr[i];
      }
      else
      {
        storedEnergy += prodArr[i] - conArr[i];
        if(storedEnergy <= 0)
        {
          storedEnergy = 0;
        }
        batArr[i] = prodArr[i] + storedEnergy;

        //Weather.update(w._id, {
        //    $set: { storedEnergy },
        //});
      }
    }
  }
  return batArr;

}

function productionGraph() {
  let prodArr = [];
  const w = Weather.find().fetch()[0];
  if (!w) {
    return [0];
  }
  for(let i = 0; i < 8; i++)
  {
    let cloud_percent = parseFloat(w.hourlyClouds[i].clouds)/100.00;
    let p = (1 - (0.75 * (Math.pow(cloud_percent, 3))));
    for(let j = i*3; j < i*3 + 3; j++)
    {
        //diving by 1000 to give KWH
        prodArr[j] = parseFloat(w.hourlyRadiation[j]) * p/1000.00 * w.areaPanel * w.absorbPanel;
    }

  }
  console.log('prodArr:' + prodArr);
  return prodArr;
}

function consumptionGraph() {
  let conArr = [];
  const w = Weather.find().fetch()[0];

  if (!w) {
    return [0];
  }
    for(let i = 0; i < 24; i++)
    {
      conArr[i] = 0;
    }

  console.log('device length: ' + w.devices.length);
  for(let i = 0; i < w.devices.length; i++)
  {
    for(let j = 0; j < 24; j++)
    {
      //console.log('device time for' + i + ' :'+ parseInt(w.devices[i].time[j]));
      if(parseInt(w.devices[i].time[j]) != 0)
      {
        //converting to KWH
          //console.log('aassigning to array: ' + parseFloat(w.devices[i].power));
        conArr[j] += parseFloat(parseFloat(w.devices[i].power)/1000.00);
        //console.log('conArr at ind '+j+' :' + conArr[j])
      }

    }
  }
  const firstHour = parseInt(w.hourlyClouds[0].time);
  console.log('conArr: ' + conArr);
  return reorder(conArr);
}

function reorder(Arr)
{
  let d = new Date();
  let firstHour = d.getHours();
  let offset = firstHour;
  let lastInd = (Arr.length - 1) - offset;
  let finalArr = [];
  console.log('arr in reorder: '+Arr);
  console.log('firsthour: ' + firstHour);
  for(let i = 0; i < 24; i++)
  {
      finalArr[i] = 0;
  }

  for(let i = 0, j = offset; i < 24; i++, j++)
  {
    //console.log('i: '+i+' j:' + j);
    if(j < 24)
    {
      console.log('it is lesser');
      finalArr[i] = parseFloat(Arr[j]);
    }
    else
    {
        console.log('it is greater');
      finalArr[i] = parseFloat(Arr[j - 24]);
    }
  }
  console.log('final arr:' + finalArr);
  return finalArr;
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
  for (let i = 0; i < 24; i ++) {
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
  productionGraphHelper() {
    return productionGraph();
  },
  consumptionGraphHelper() {
    return consumptionGraph();
  },
  location() {
    const w = Weather.find().fetch();
    if (!w[0]){
      return '(No current location)';
    } else {
      return `(${w[0].name})`;
    }
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
  this.$('.carousel.carousel-slider').carousel({fullWidth: true});

  this.autorun(() => {
    if (this.subscriptionsReady()){
    var ctx = document.getElementById("myChart");

    var fillBetweenLinesPlugin = {
      afterDatasetsDraw: function (chart) {
        var ctx = chart.chart.ctx;
        var xaxis = chart.scales['x-axis-0'];
        var yaxis = chart.scales['y-axis-0'];
        var datasets = chart.data.datasets;
        ctx.save();

        for (var d = 0; d < datasets.length; d++) {
          var dataset = datasets[d];
          if (dataset.fillBetweenSet == undefined) {
            continue;
          }

          // get meta for both data sets
          var meta1 = chart.getDatasetMeta(d);
          var meta2 = chart.getDatasetMeta(dataset.fillBetweenSet);

          ctx.beginPath();

          // vars for tracing
          var curr, prev;

          // trace set1 line
          for (var i = 0; i < meta1.data.length; i++) {
            curr = meta1.data[i];
            if (i === 0) {
              ctx.moveTo(curr._view.x, curr._view.y);
              ctx.lineTo(curr._view.x, curr._view.y);
              prev = curr;
              continue;
            }
            if (curr._view.steppedLine === true) {
              ctx.lineTo(curr._view.x, prev._view.y);
              ctx.lineTo(curr._view.x, curr._view.y);
              prev = curr;
              continue;
            }
            if (curr._view.tension === 0) {
              ctx.lineTo(curr._view.x, curr._view.y);
              prev = curr;
              continue;
            }

            ctx.bezierCurveTo(
                prev._view.controlPointNextX,
                prev._view.controlPointNextY,
                curr._view.controlPointPreviousX,
                curr._view.controlPointPreviousY,
                curr._view.x,
                curr._view.y
            );
            prev = curr;
          }


          // connect set1 to set2 then BACKWORDS trace set2 line
          for (var i = meta2.data.length - 1; i >= 0; i--) {
            curr = meta2.data[i];
            if (i === meta2.data.length - 1) {
              ctx.lineTo(curr._view.x, curr._view.y);
              prev = curr;
              continue;
            }
            if (curr._view.steppedLine === true) {
              ctx.lineTo(prev._view.x, curr._view.y);
              ctx.lineTo(curr._view.x, curr._view.y);
              prev = curr;
              continue;
            }
            if (curr._view.tension === 0) {
              ctx.lineTo(curr._view.x, curr._view.y);
              prev = curr;
              continue;
            }

            // reverse bezier
            ctx.bezierCurveTo(
                prev._view.controlPointPreviousX,
                prev._view.controlPointPreviousY,
                curr._view.controlPointNextX,
                curr._view.controlPointNextY,
                curr._view.x,
                curr._view.y
            );
            prev = curr;
          }

          ctx.closePath();
          ctx.fillStyle = dataset.fillBetweenColor || "rgba(0,0,0,0.1)";
          ctx.fill();
        }
      } // end afterDatasetsDraw
    }; // end fillBetweenLinesPlugin

    Chart.pluginService.register(fillBetweenLinesPlugin);
    Chart.defaults.global.responsive = true
    Chart.defaults.global.maintainAspectRatio = true
    var data = {
    labels: xaxis(),
    datasets: [
      {
        label: "Solar Energy Generated",
        fill: false,
        lineTension: 0,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: productionGraph(),
        spanGaps: false,
        //fillBetweenSet: 1,
        //fillBetweenColor: "rgba(255,0,0, 0.2)",
      },
      {
        label: "Your Energy Usage",
        fill: false,
        lineTension: 0,
        backgroundColor: "rgba(128,0,0,0.4)",
        borderColor: "rgba(128,0,0,0.4)",
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: consumptionGraph(),
        spanGaps: false,
      },
      {
        label: "Your Battery Storage",
        fill: false,
        lineTension: 0,
        backgroundColor: "rgba(0,0,0,1)",
        borderColor: "rgba(0,0,0,1)",
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: batteryGraph(),
        spanGaps: false,
      }
    ]
  };
    let options= {
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'kW'
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Time of Day'
          }
        }]
      }
    }
  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: options,
  });
  };
});
});

