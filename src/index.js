const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs');
const path = require('path');

const app = express();

const jsonParser = bodyParser.json({ limit: '50mb' })

console.log('current directory:', __dirname);

fs.mkdirSync('/app/macroStore/v0', { recursive: true });
fs.writeFileSync('/app/macroStore/v0/test.json', '{"key": "value"}');

// setting up fake file structure to show off api in structure
fs.mkdirSync('/app/macroStore/api', { recursive: true });
fs.writeFileSync('/app/macroStore/api/update', '');

app.post('/api/update', jsonParser, (req, res) => {
  const headers = req.headers;
  const body = req.body;

  if (!process.env.TOKEN) {
    res.send('No token set in environment variable TOKEN');
    return;
  };

  if (!headers['auth-token']) {
    res.send('No auth-token header set');
    return;
  };

  if (!req.query['path']) {
    res.send('No path query parameter set');
    return;
  };

  if (!req.body) {
    res.send('No body set');
    return;
  }

  const absPath = path.resolve(path.join('/app/macroStore/', req.query['path']));

  if (!absPath.startsWith('/app/macroStore/')) {
    res.send('Path is not in macroStore');
    return;
  };

  console.log('Update request received');
  if (req.headers['auth-token'] === process.env.TOKEN) {
    //make sure the directory exists
    !fs.existsSync(absPath) && fs.mkdirSync(path.dirname(absPath), { recursive: true });

    !fs.existsSync(path.join(absPath, 'stations')) && fs.mkdirSync(path.join(absPath, 'stations'), { recursive: true });
    console.log('Writing stations')

    fs.writeFileSync(path.join(absPath, 'stations.json'), JSON.stringify(body.stations));

    Object.values(body.stations).forEach((station) => {
      console.log(`Writing to ${path.join(absPath, `stations/${station.stationID}.json`)}`);
      fs.writeFileSync(path.join(absPath, `stations/${station.stationID}.json`), JSON.stringify(station));
    });

    !fs.existsSync(path.join(absPath, 'vehicles')) && fs.mkdirSync(path.join(absPath, 'vehicles'), { recursive: true });
    console.log('Writing vehicles')

    fs.writeFileSync(path.join(absPath, 'vehicles.json'), JSON.stringify(body.vehicles));

    Object.values(body.vehicles).forEach((vehicle) => {
      console.log(`Writing to ${path.join(absPath, `vehicles/${vehicle.tripID}.json`)}`);
      fs.writeFileSync(path.join(absPath, `vehicles/${vehicle.tripID}.json`), JSON.stringify(vehicle));
    });

    fs.readdirSync(path.join(absPath, 'vehicles')).forEach((file) => {
      if (!Object.keys(body.vehicles).includes(file.replace('.json', ''))) {
        console.log(`Deleting ${path.join(absPath, `vehicles/${file}`)}`);
        fs.rmSync(path.join(absPath, `vehicles/${file}`));
      }
    });

    !fs.existsSync(path.join(absPath, 'keys')) && fs.mkdirSync(path.join(absPath, 'keys'), { recursive: true });
    console.log(`Writing to ${path.join(absPath, 'keys/stations.json')}`);
    fs.writeFileSync(path.join(absPath, 'keys/stations.json'), JSON.stringify(Object.keys(body.stations)));
    console.log(`Writing to ${path.join(absPath, 'keys/vehicles.json')}`);
    fs.writeFileSync(path.join(absPath, 'keys/vehicles.json'), JSON.stringify(Object.keys(body.vehicles)));

    //check if /app/macroStore/agencies.json exists and if not create it, otherwise append to it
    if (!fs.existsSync('/app/macroStore/agencies.json')) {
      fs.writeFileSync('/app/macroStore/agencies.json', JSON.stringify([]));
    }
    const agencies = JSON.parse(fs.readFileSync('/app/macroStore/agencies.json'));
    if (!agencies.includes(req.query['path'])) {
      agencies.push(req.query['path']);
      fs.writeFileSync('/app/macroStore/agencies.json', JSON.stringify(agencies));
    };

    console.log('Update successful');
  } else {
    console.log('someone is being naughty');
  }

  res.send(absPath);
});

app.listen(3000, () => {
  console.log('Update server listening on port 3000!');
});