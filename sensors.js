
/* TODO : Créer le modèle objet ici */

export const typeEnum = {
  NONE: 'NONE',
  POSITIVE_NUMBER: 'POSITIVE_NUMBER',
  PERCENT: 'PERCENT',
  ON_OFF: 'ON_OFF'
};
Object.freeze(typeEnum);

export class Data {

}

export class TimeSeries extends Data {
  constructor(values, labels) {
    super();
    this.values = values;
    this.labels = labels;
  }

  set values(values) {
    if (!(values instanceof Array)) { throw new Error('Not an Array'); }
    values.forEach((val) => {
      if (!Number.isSafeInteger(val)) {
        throw new Error('Integer Needed');
      }
    });
    this.ts_values = values;
  }

  get values() {
    return this.ts_values;
  }

  set labels(labels) {
    if (!(labels instanceof Array)) { throw new Error('Not an Array'); }
    labels.forEach((lab) => {
      if (typeof lab !== 'string') {
        throw new Error('String Needed');
      }
    });
    this.ts_labels = labels;
  }

  get labels() {
    return this.ts_labels;
  }
}

export class Datum extends Data {
  constructor(value) {
    super();
    this.value = value;
  }

  set value(value) {
    if (!Number.isSafeInteger(value)) {
      throw new Error('Integer Needed');
    }
    this.d_value = value;
  }

  get value() {
    return this.d_value;
  }
}

export class Sensor {
  constructor(id, name, data, type) {
    this.id = id;
    this.name = name;
    this.data = data;
    this.type = type;
  }

  set id(id) {
    if (!Number.isSafeInteger(id)) {
      throw new Error('Integer Needed');
    }
    this.s_id = id;
  }

  get id() {
    return this.s_id;
  }

  set name(name) {
    if (typeof name !== 'string') {
      throw new Error('String Needed');
    }
    this.s_name = name;
  }

  get name() {
    return this.s_type;
  }

  set type(type) {
    if (!(type in typeEnum)) {
      throw new Error('Unknown Type');
    }
    this.s_type = type;
  }

  get type() {
    return this.s_name;
  }

  set data(data) {
    if (!(data instanceof Data)) {
      throw new Error('Data Needed');
    }
    this.s_data = data;
  }
  get data() {
    return this.s_data;
  }

  toJSON() {
    let v = '';
    if (this.s_data instanceof Datum) {
      v = this.s_data.value;
    } else {
      //TODO TimeSeries JSON
    }
    return '{\"id\":\"'+this.s_id+'\",\"name\":\"'+this.s_name+'\",\"data\":\"'+v+'\",\"type\":\"'+this.s_type+'\"}';
  }
}

export class Parser {
  constructor(json) {
    this.json = json;
  }

  set json(json) {
    if (typeof json !== 'object') {
      throw new Error('JSON Needed');
    }
    this.p_json = json;
  }
  get data() {
    return this.p_json;
  }

  makeSensor() {
    let d = new Data();
    if (typeof this.p_json.data === 'object') {
      if (!this.p_json.data.labels) {
        d = new Datum(this.p_json.data.value);
      } else {
        d = new TimeSeries(this.p_json.data.values, this.p_json.data.labels);
      }
    } else {
      throw new Error('Data Needed');
    }
    return new Sensor(this.p_json.id, this.p_json.name, d, this.p_json.type);
  }
}
