import { Contacts } from '../../api/contacts/contacts.js';
import { _ } from 'meteor/underscore';

/**
 * A list of Stuff to pre-fill the Collection.
 * @type {*[]}
 */
const contactSeeds = [
  { first: 'Dennis',
    last: 'Takayesu',
    address: '94-452 Hokuala St.',
    telephone: '808-222-2113',
    email: 'dennistakayesu@gmail.com' },
  { first: 'Lyndsay',
    last: 'Takayesu',
    address: '3071 Pualei Circle Apt 207',
    telephone: '808-123-5431',
    email: 'lyndsayt13@gmail.com' },
  { first: 'Pineapple',
    last: 'Cute',
    address: 'Pineapple Cute St.',
    telephone: '808-212-5312',
    email: 'cutepine@gmail.com' },
];

/**
 * Initialize the Stuff collection if empty with seed data.
 */
if (Contacts.find().count() === 0) {
  _.each(contactSeeds, function seedContacts(contact) {
    Contacts.insert(contact);
  });
}
