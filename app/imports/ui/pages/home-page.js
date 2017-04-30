import { Template } from 'meteor/templating';
import { Weather } from '../../api/weather/weather.js';
import { Meteor } from 'meteor/meteor';

function dayOfYear(d) {   // d is a Date object
    const yn = d.getFullYear();
    const mn = d.getMonth();
    const dn = d.getDate();
    const d1 = new Date(yn,0,1,12,0,0); // noon on Jan. 1
    const d2 = new Date(yn,mn,dn,12,0,0); // noon on input date
    const ddiff = Math.round((d2-d1)/864e5);
    return ddiff+1; }

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
  efficiency() {
    const w_temp = Weather.find().fetch();
    const w = w_temp[0];
    const cloud_percent = parseFloat(w.clouds)/100.00;
    //const day = dayofYear(new Date());
    //const rad_ind = parseInt(day)*24;
    const actual_radiation = cloud_percent * w.radiation;
    let total_consumption;
    //for each slider in electrical consumption label do this:
    total_consumption += slider.value;
    //assign total_consumption or return it

    //get panel size from ui
    const panelSize;
    const total_energy = actual_radiation*panelSize - total_consumption
  },
  totalEnergyUse() {
    let total_consumption;
    //for each slider in electrical consumption label do this:
      total_consumption += slider.value;
      //assign total_consumption or return it
  },
  totalEnergyGained() {

  }
});

Template.Home_Page.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('Weather');
  });
});

Template.Home_Page.events({
  'submit .contact-data-form'(event, instance) {
    event.preventDefault();
    // Get name (text field)
    const latitude = event.target.Latitude.value;
    const longitude = event.target.Longitude.value;
    Meteor.call('checkWeather', latitude, longitude);
  },
});
