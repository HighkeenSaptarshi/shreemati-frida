"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.itemsHaveType = exports.getThreatCount = void 0;
var _threat = require("./threat");
const getThreatCount = () => {
  return _threat.Threat.getValues().length;
};
exports.getThreatCount = getThreatCount;
const itemsHaveType = (data, desidedType) => {
  return data.every(item => typeof item === desidedType);
};
exports.itemsHaveType = itemsHaveType;
//# sourceMappingURL=utils.js.map