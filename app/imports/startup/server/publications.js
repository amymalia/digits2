/**
 * Created by ataka on 10/16/16.
 */
import { Contacts } from '../../api/contacts/contacts.js';
import { Meteor } from 'meteor/meteor';

Meteor.publish('Contacts', function publishContacts() {
  return Contacts.find();
});
