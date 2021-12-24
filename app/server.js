import express from 'express';

const app = express();
const port = 3000
const hostname = '0.0.0.0';

const serviceSetup = async () => {
    return Promise.resolve();
};

const main = async () => {
  await serviceSetup();

  // Add JSON body parsing
  app.use(express.json());

  app.get('/health-check', (req, res) => {
    res.send("works");
  });

  app.listen(port, hostname, () => {
    console.log(`Storage Service running at http://${hostname}:${port}`)
  });
};

main();
