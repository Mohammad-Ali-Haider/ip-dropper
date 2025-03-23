export async function sendFile(req, res) {
  try {
    const { ip } = req.params;
    
    // Mock successful response
    res.json({
      message: 'File transfer simulated successfully',
      timestamp: new Date().toISOString(),
      targetIp: ip,
      status: 'completed'
    });

  } catch (error) {
    console.error('Error in sendFile:', error);
    res.status(500).json({ 
      error: 'Failed to simulate file send',
      details: error.message 
    });
  }
}
