import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import BaseCollection from '/imports/api/base/BaseCollection';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

/** @module Interest */

/**
 * Represents a specific interest, such as "Software Engineering".
 * @extends module:Base~BaseCollection
 */
class WeatherCollection extends BaseCollection {

  /**
   * Creates the Interest collection.
   */
  constructor() {
    super('Weather', new SimpleSchema({
      latitude: { type: Number, optional: false },
      longitude: { type: Number, optional: false },
      description: { type: String, optional: false },
      temperature: { type: String, optional: false },
      windSpeed: { type: String, optional: false },
      clouds: { type: String, optional: false },
      name: { type: String, optional: false },
      radiation: { type: String, optional: false },
      areaPanel: { type: String, optional: true },
      absorbPanel: { type: String, optional: true },
      storedEnergy: { type: String, optional: true },
      devices: { type: [Object], optional: true, blackbox: true },
      radiationForecast: { type: [Number], optional: true },
      cloudForecast: { type: [Number], optional: true },
      battery: { type: String, optional: true },
    }));
  }

  /**
   * Defines a new Interest.
   * @example
   * Interests.define({ name: 'Software Engineering',
   *                    description: 'Methods for group development of large, high quality software systems' });
   * @param { Object } description Object with keys name and description.
   * Name must be previously undefined. Description is optional.
   * Creates a "slug" for this name and stores it in the slug field.
   * @throws {Meteor.Error} If the interest definition includes a defined name.
   * @returns The newly created docID.
   */
  define({ latitude, longitude, description, temperature, windSpeed, clouds, name, radiation, areaPanel = 0, absorbPanel = 0, storedEnergy = 0, devices = [{ name:'Lab', power:5000, time:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
    { name:'Small Device', power:330, time:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
    { name:'Large Device', power:35000, time:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] }], radiationForecast = [], cloudForecast = [], battery = 0}) {
    return this._collection.insert({ latitude, longitude, description, temperature, windSpeed, clouds, name, radiation, areaPanel, absorbPanel, storedEnergy, devices, radiationForecast, cloudForecast, battery });
  }

  /**
   * Returns an object representing the Interest docID in a format acceptable to define().
   * @param docID The docID of an Interest.
   * @returns { Object } An object representing the definition of docID.
   */
  dumpOne(docID) {
    const doc = this.findDoc(docID);
    const name = doc.name;
    const description = doc.description;
    return { name, description };
  }
}

/**
 * Provides the singleton instance of this class to all other entities.
 */
export const Weather = new WeatherCollection();
