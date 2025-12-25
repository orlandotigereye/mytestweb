exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from example function", site: "example-site", time: new Date().toISOString() })
  };
};
