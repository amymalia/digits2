import { Weather } from '/imports/api/weather/weather';

export function removeAllEntities() {
  Weather.removeAll();
}
