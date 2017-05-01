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
});

Template.Electric_Consumption_Page.events({
  'click .device-sliders'(event, instance) {
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
