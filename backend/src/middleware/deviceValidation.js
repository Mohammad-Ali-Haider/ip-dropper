export function validateDeviceFields(req, res, next) {
  console.log('Validating device fields:', req.body);
  
  const { name, ipaddress } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Valid device name is required' });
  }

  if (!ipaddress || typeof ipaddress !== 'string') {
    return res.status(400).json({ error: 'Valid IP address is required' });
  }

  // Basic IP address format validation
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ipaddress)) {
    return res.status(400).json({ error: 'Invalid IP address format' });
  }

  // Validate IP address numbers
  const parts = ipaddress.split('.').map(Number);
  if (parts.some(part => part < 0 || part > 255)) {
    return res.status(400).json({ error: 'Invalid IP address numbers' });
  }

  next();
}
