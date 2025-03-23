

// Fallback client-side detection
exportconst detectClientInfo = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) {
      setDeviceType('mac');
      setDeviceName('Mac');
    } else if (userAgent.includes('linux')) {
      setDeviceType('linux');
      setDeviceName('Linux');
    } else if (userAgent.includes('win')) {
      setDeviceType('windows');
      setDeviceName('Windows');
    }
  };