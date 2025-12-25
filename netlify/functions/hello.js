exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from Netlify Function!",
      timestamp: new Date().toISOString()
    })
  };
};