import {Template} from 'meteor/templating';
import {Weather} from '../../api/weather/weather.js';
import {_} from 'meteor/underscore';

Template.Edit_Device.onRendered(function onRendered() {
  this.$('.devices').popup({
    on: 'click',
    inline: true
  });
});

Template.Edit_Device.onCreated(function onCreated() {
  this.subscribe(Weather.getPublicationName());
});

Template.Edit_Device.helpers({

});

Template.Edit_Device.events({
  'click .update'(event, instance) {
    event.preventDefault();
    // Get name (text field)
    const name = document.getElementById("editDeviceNameInput").value;
    const power = document.getElementById("editDevicePowerInput").value;
    const weathers = Weather.find().fetch();
    const weather = weathers[0];
    let devices = weather.devices;
    devices.push({name: name, power: power, time:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] });
    Weather.update(weather._id, {
      $set: { devices },
    });
    //Meteor.call('checkRadiation', latitude, longitude);
  },
  'click .remove'(event, instance) {
    event.preventDefault();
    // Get name (text field)
    console.log("IN HEAAAAA!!!!");
    const name = document.getElementById("editDeviceNameInput-Refrigerator").value;
    const power = document.getElementById("editDevicePowerInput-Refrigerator").value;
    const weathers = Weather.find().fetch();
    const weather = weathers[0];
    let devices = weather.devices;
    for (let i = 0; i < devices.length; i++) {
      if (devices[i].name === 'Refrigerator') {
        devices.splice(i, 1);
      }
    }
    console.log(devices);
    Weather.update(weather._id, {
      $set: { devices },
    });
    //Meteor.call('checkRadiation', latitude, longitude);
  },
});
