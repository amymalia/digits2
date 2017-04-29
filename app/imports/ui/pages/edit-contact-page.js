import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { Contacts, ContactsSchema } from '../../api/weather/weather.js';

/* eslint-disable object-shorthand, no-unused-vars */

const displayErrorMessages = 'displayErrorMessages';

Template.Edit_Contact_Page.onCreated(function onCreated() {
  this.subscribe('Contacts');
  this.messageFlags = new ReactiveDict();
  this.messageFlags.set(displayErrorMessages, false);
  this.context = ContactsSchema.namedContext('Edit_Contact_Page');
});


Template.Edit_Contact_Page.helpers({
  contactDataField(fieldName) {
    const contactData = Contacts.findOne(FlowRouter.getParam('_id'));
    // See https://dweldon.silvrback.com/guards to understand '&&' in next line.
    return contactData && contactData[fieldName];
  },
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';
  },
  fieldError(fieldName) {
    const invalidKeys = Template.instance().context.invalidKeys();
    const errorObject = _.find(invalidKeys, (keyObj) => keyObj.name === fieldName);
    return errorObject && Template.instance().context.keyErrorMessage(errorObject.name);
  },
});

Template.Edit_Contact_Page.events({
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
      Contacts.update(FlowRouter.getParam('_id'), { $set: newContactData });
      instance.messageFlags.set(displayErrorMessages, false);
      FlowRouter.go('Home_Page');
    } else {
      instance.messageFlags.set(displayErrorMessages, true);
    }
  },
});

