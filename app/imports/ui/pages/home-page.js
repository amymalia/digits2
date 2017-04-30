import { Template } from 'meteor/templating';
import { Weather } from '../../api/weather/weather.js';
import { Meteor } from 'meteor/meteor';

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
    Meteor.call('checkRadiation', latitude, longitude);
  },
});
