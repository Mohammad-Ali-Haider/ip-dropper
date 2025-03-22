export const validateDeviceFields = (req, res, next) => {
  const { name, ipaddress, type } = req.body;
  
  if (!name || !ipaddress || !type) {
    return res.status(400).json({ error: 'Missing required device fields' });
  }
  
  next();
};

export const validateReceivingStatus = (req, res, next) => {
  if (typeof req.body.isReceiving !== 'boolean') {
    return res.status(400).json({ error: 'isReceiving must be a boolean' });
  }
  
  next();
};