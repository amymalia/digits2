import { Weather } from '../../api/weather/weather.js';
import { _ } from 'meteor/underscore';

/**
 * A list of Stuff to pre-fill the Collection.
 * @type {*[]}
 */
const contactSeeds = [

];

/**
 * Initialize the Stuff collection if empty with seed data.
 */
if (Weather.find().count() === 0) {
  //do nothing
}
