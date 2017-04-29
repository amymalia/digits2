import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/underscore';
import { Contacts, ContactsSchema } from '../../api/weather/weather.js';
import { FlowRouter } from 'meteor/kadira:flow-router';


/* eslint-disable no-param-reassign */

const displayErrorMessages = 'displayErrorMessages';

Template.Add_Contact_Page.onCreated(function onCreated() {
  this.messageFlags = new ReactiveDict();
  this.messageFlags.set(displayErrorMessages, false);
  this.context = ContactsSchema.namedContext('Add_Contact_Page');
});

Template.Add_Contact_Page.helpers({
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';
  },
  fieldError(fieldName) {
    const invalidKeys = Template.instance().context.invalidKeys();
    const errorObject = _.find(invalidKeys, (keyObj) => keyObj.name === fieldName);
    return errorObject && Template.instance().context.keyErrorMessage(errorObject.name);
  },
});

Template.Add_Contact_Page.events({
  'submit .contact-data-form'(event, instance) {
    event.preventDefault();
    // Get name (text field)
    const first = event.target.First.value;
    const last = event.target.Last.value;
    const address = event.target.Address.value;
    const telephone = event.target.Telephone.value;
    const email = event.target.Email.value;

    const newContactData = { first, last, address, telephone, email };
    // Clear out any old validation errors.
    instance.context.resetValidation();
    // Invoke clean so that newStudentData reflects what will be inserted.
    ContactsSchema.clean(newContactData);
    // Determine validity.
    instance.context.validate(newContactData);
    if (instance.context.isValid()) {
      Contacts.insert(newContactData);
      instance.messageFlags.set(displayErrorMessages, false);
      FlowRouter.go('Home_Page');
    } else {
      instance.messageFlags.set(displayErrorMessages, true);
    }
  },
});

