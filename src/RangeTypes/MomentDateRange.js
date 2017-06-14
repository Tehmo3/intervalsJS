const Range = require('./Range.js');
const utils = require('../utils');
const moment = require('moment');


const _internalRange = utils.namedList(['lower', 'upper', 'lowerInc', 'upperInc', 'empty']);
const _emptyInternalRange = _internalRange([null, null, false, false, true]);

class MomentDateRange extends Range {
  constructor(settings) {
    settings.type = 'date';
    if (settings.upper && typeof settings.upper === 'string') {
      settings.upper = moment(settings.upper, 'MM-DD-YYYY').isValid() ? moment(settings.upper, 'MM-DD-YYYY') : moment(settings.upper, 'YYYY-MM-DD');
    }
    if (settings.lower && typeof settings.lower === 'string') {
      settings.lower = moment(settings.lower, 'MM-DD-YYYY').isValid() ? moment(settings.lower, 'MM-DD-YYYY') : moment(settings.lower, 'YYYY-MM-DD');
    }
    super(settings);
  }

  isEqual(other) {
    if (!this || !other || !this.isValidRange(other)) {
      return false;
    }
    return this.upper.isSame(other.upper) &&
    this.lower.isSame(other.lower) && this.lowerInc === other.lowerInc &&
    this.upperInc === other.upperInc;
  }

  replace(settings = {}) {
    if (settings.upper !== null && settings.upper !== undefined) {
      if (typeof settings.upper === 'string') {
        this._range.upper = moment(settings.upper, 'MM-DD-YYYY').isValid() ? moment(settings.upper, 'MM-DD-YYYY') : moment(settings.upper, 'YYYY-MM-DD');
      } else {
        this._range.upper = settings.upper;
      }
    }
    if (settings.lower !== null && settings.lower !== undefined) {
      if (typeof settings.lower === 'string') {
        this._range.lower = moment(settings.lower, 'MM-DD-YYYY').isValid() ? moment(settings.lower, 'MM-DD-YYYY') : moment(settings.lower, 'YYYY-MM-DD');
      } else {
        this._range.lower = settings.lower;
      }
    }
    if (settings.lowerInc !== undefined) {
      this._range.lowerInc = settings.lowerInc;
    }
    if (settings.upperInc !== undefined) {
      this._range.upperInc = settings.upperInc;
    }
    return this;
  }

  contains(other) {
    if (this.isValidRange(other)) {
      if (!other || (other.startsAfter(this) && other.endsBefore(this))) {
        return true;
      }
      return false;
    } else if (moment(other, ['MM-DD-YYYY', 'YYYY-MM-DD']).isValid()) {
      let isInLower = true;
      if (this.lower) {
        isInLower = this.lower.isBefore(moment(other, ['MM-DD-YYYY', 'YYYY-MM-DD']));
      }

      let isInUpper = true;
      if (this.upper) {
        isInUpper = this.upper.isSameOrAfter(moment(other, ['MM-DD-YYYY', 'YYYY-MM-DD']));
      }

      return isInLower && isInUpper;
    }
    throw new Error('Unsupported type to test for inclusion');
  }

  overlap(other) {
    let a;
    let b;
    if (!this || !other) {
      return false;
    }

    if (this.endsBefore(other)) {
      a = this;
      b = other;
    } else {
      a = other;
      b = this;
    }

    if (a.upper === null || b.lower === null) {
      return true;
    }
    return a.upper.isAfter(b.lower) || (a.upper.isSame(b.lower) && a.upperInc && b.lowerInc);
  }

  adjacent(other) {
    if (!this.isValidRange(other)) {
      throw new Error('Unsupported type to test for inclusion');
    }
    return (this.lower.isSame(other.upper) && this.lowerInc !== other.upperInc) ||
              (this.upper.isSame(other.lower) && this.upperInc !== other.lowerInc);
  }

  union(other) {
    if (!this.isValidRange(other)) {
      throw new Error('Unsupported type to test for union');
    }

    let a;
    let b;
    if (!this.startsAfter(other)) {
      a = this;
      b = other;
    } else {
      a = other;
      b = this;
    }

    if (a.upper.isSameOrBefore(b.lower) && !a.adjacent(b)) {
      throw new Error('Ranges must be either adjacent or overlapping');
    }

    let upper;
    let upperInc;
    if (a.upper.isSame(b.upper)) {
      upper = a.upper;
      upperInc = a.upperInc || b.upperInc;
    } else if (a.upper.isBefore(b.upper)) {
      upper = b.upper;
      upperInc = b.upperInc;
    } else {
      upper = a.upper;
      upperInc = a.upperInc;
    }

    return new Range({ lower: a.lower, upper, lowerInc: a.lowerInc, upperInc, type: this.type });
  }


  startsAfter(other) {
    if (this.isValidRange(other)) {
      if (this.lower !== null && other.lower !== null && this.lower.isSame(other.lower)) {
        return other.lowerInc || !this.lowerInc;
      } else if (this.lower === null) {
        return false;
      } else if (other.lower === null) {
        return true;
      }
      return this.lower.isAfter(other.lower);
    } else if (moment(other, ['MM-DD-YYYY', 'YYYY-MM-DD']).isValid()) {
      return this.lower.isSameOrAfter(moment(other, ['MM-DD-YYYY', 'YYYY-MM-DD']));
    }
    throw new Error('Unsupported type to test for starts after');
  }

  endsBefore(other) {
    if (this.isValidRange(other)) {
      if (this.upper !== null && other.upper !== null && this.upper.isSame(other.upper)) {
        return other.upperInc || !this.upperInc;
      } else if (this.upper === null) {
        return false;
      } else if (other.upper === null) {
        return true;
      }
      return this.upper.isSameOrBefore(other.upper);
    } else if (moment(other, ['MM-DD-YYYY', 'YYYY-MM-DD']).isValid()) {
      return this.upper.isSameOrBefore(moment(other, ['MM-DD-YYYY', 'YYYY-MM-DD']));
    }
    throw new Error('Unsupported type to test for ends before');
  }

  startsWith(other) {
    if (this.isValidRange(other)) {
      if (this.lowerInc === other.lowerInc) {
        return this.lower.isSame(other.lower);
      }
      return false;
    } else if (moment(other, ['MM-DD-YYYY', 'YYYY-MM-DD']).isValid()) {
      if (this.lowerInc) {
        return this.lower.isSame(moment(other, ['MM-DD-YYYY', 'YYYY-MM-DD']));
      }
      return false;
    }
    throw new Error('Unsupported type to test for starts with');
  }

  endsWith(other) {
    if (this.isValidRange(other)) {
      if (this.upperInc === other.upperInc) {
        return this.upper.isSame(other.upper);
      }
      return false;
    } else if (moment(other, ['MM-DD-YYYY', 'YYYY-MM-DD']).isValid()) {
      if (this.upperInc) {
        return this.upper.isSame(moment(other, ['MM-DD-YYYY', 'YYYY-MM-DD']));
      }
      return false;
    }
    throw new Error('Unsupported type to test for ends with');
  }
}

module.exports = MomentDateRange;