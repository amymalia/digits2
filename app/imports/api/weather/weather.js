/**
 * Created by ataka on 10/16/16.
 */
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

/* eslint-disable object-shorthand */

export const Weather = new Mongo.Collection('Weather');

/**
 * Create the schema for Contacts
 */
export const WeatherSchema = new SimpleSchema({
  description: { label: 'description', type: String, optional: false, max: 200, },
  temperature: { label: 'coord', type: String, optional: false, max: 200, },
  windSpeed: { label: 'windSpeed', type: String, optional: false, max: 200, },
  clouds: { label: 'clouds', type: String, optional: false, max: 200, },
  name: { label: 'name', type: String, optional: false, max: 200, },
  radiation: { label: 'radiation', type: String, optional: false, max: 200, },
  areaPanel: { label: 'areaPanel', type: String, optional: true, max: 200, },
  absorbPanel: { label: 'absorbPanel', type: String, optional: true, max: 200, },
  storedEnergy: { label: 'storedEnergy', type: String, optional: true, max: 200, },
  devices: { label: 'devices', type: [Object], optional: true, max: 200, },
  dayRadiationForecast: { label: 'dayRadiationForecast', type: [Number], optional: true, max: 200, },
});

Weather.attachSchema(WeatherSchema);
