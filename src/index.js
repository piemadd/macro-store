const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

console.log('current directory:', __dirname);

fs.mkdirSync('/app/macroStore/v0', { recursive: true });
fs.writeFileSync('/app/macroStore/v0/test.json', '{"key": "value"}');

// setting up fake file structure to show off api in structure
fs.mkdirSync('/app/macroStore/api', { recursive: true });
fs.writeFileSync('/app/macroStore/api/update', '');

app.put('/api/update', (req, res) => {
  if (!process.env.TOKEN) {
    res.send('No token set in environment variable TOKEN');
    return;
  };

  if (!req.headers['Auth-Token']) {
    res.send('No Auth-Token header set');
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
  let fileBody = {};

  try {
    fileBody = JSON.parse(req.body);
  } catch (e) {
    res.send('Body is not valid JSON');
    return;
  };

  if (!absPath.startsWith('/app/macroStore/')) {
    res.send('Path is not in macroStore');
    return;
  };

  console.log('Update request received');
  if (req.headers['Auth-Token'] === process.env.TOKEN) {
    //make sure the directory exists
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    
    fs.mkdirSync(path.join(absPath, 'stations'), { recursive: true });
    Object.values(fileBody.stations).forEach((station) => {
      fs.writeFileSync(path.join(absPath, `stations/${station.stationID}.json`), JSON.stringify(station));
    });

    fs.mkdirSync(path.join(absPath, 'vehicles'), { recursive: true });
    Object.values(fileBody.vehicles).forEach((vehicle) => {
      fs.writeFileSync(path.join(absPath, `vehicles/${vehicle.tripID}.json`), JSON.stringify(vehicle));
    });

    fs.mkdirSync(path.join(absPath, 'all'), { recursive: true });
    fs.writeFileSync(path.join(absPath, 'all/stations.json'), JSON.stringify(stations));
    fs.writeFileSync(path.join(absPath, 'all/vehicles.json'), JSON.stringify(vehicles));
  } else {
    console.log('someone is being naughty');
  }

  res.send(absPath);
});

app.listen(3000, () => {
  console.log('Update server listening on port 3000!');
});