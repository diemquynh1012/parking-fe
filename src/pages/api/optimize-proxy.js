export default async function handler(req, res) {
  const response = await fetch('http://160.191.49.99:8000/optimize', {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
