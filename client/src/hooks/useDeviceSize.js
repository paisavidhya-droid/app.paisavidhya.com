// client\src\hooks\useDeviceSize.js

import { useContext } from 'react';
import { DeviceSizeContext } from '../context/DeviceSizeContext';

const useDeviceSize = () => {
  return useContext(DeviceSizeContext);
};

export default useDeviceSize;
