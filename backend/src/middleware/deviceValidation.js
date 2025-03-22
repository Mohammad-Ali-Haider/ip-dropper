export const validateDeviceFields = (req, res, next) => {
  const { name, ipaddress, type } = req.body;
  
  if (!name || !ipaddress || !type) {
    return res.status(400).json({ error: 'Missing required device fields' });
  }
  
  next();
};