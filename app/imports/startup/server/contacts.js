import { Contacts } from '../../api/contacts/contacts.js';
import { _ } from 'meteor/underscore';

/**
 * A list of Stuff to pre-fill the Collection.
 * @type {*[]}
 */
const contactSeeds = [
  { first: 'Amy',
    last: 'Takayesu',
    address: '1680 East West Road POST314-7',
    telephone: '808-956-1111',
    email: 'amytaka@hawaii.edu' },
  { first: 'Pizza',
    last: 'Hut',
    address: '786 Kapahulu Ave',
    telephone: '808-738-5900',
    email: 'pizzahut@gmail.com' },
  { first: 'Papa',
    last: 'Johns',
    address: '1646 Kapiolani Blvd',
    telephone: '808-592-7272',
    email: 'papajohns@gmail.com' },
];

/**
 * Initialize the Stuff collection if empty with seed data.
 */
if (Contacts.find().count() === 0) {
  _.each(contactSeeds, function seedContacts(contact) {
    Contacts.insert(contact);
  });
}
