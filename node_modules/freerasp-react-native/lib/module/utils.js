import { Threat } from './threat';
export const getThreatCount = () => {
  return Threat.getValues().length;
};
export const itemsHaveType = (data, desidedType) => {
  return data.every(item => typeof item === desidedType);
};
//# sourceMappingURL=utils.js.map