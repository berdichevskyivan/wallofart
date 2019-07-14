const express = require('express');
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const { Client, Pool } = require('pg');

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
  });

} else {
  const app = express();

  const pool = new Pool({
    user:'postgres',
    host:'localhost',
    database:'wall_of_art',
    password:'rakmodar',
    port:5432
  });

  // Priority serve any static files.
  app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

  //Remember to now Allow everyone (*) , just the React instance
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.use(express.json({limit:'10mb',extended:true}));       // to support JSON-encoded bodies
  app.use(express.urlencoded({limit:'10mb',extended:true})); // to support URL-encoded bodies

  // Answer API requests.
  app.get('/api', function (req, res) {
    res.set('Content-Type', 'application/json');
    res.send('{"message":"Hello from the custom server!"}');
  });

  app.get('/getCanvases', function (req, res) {
    let data = [];
    res.set('Content-Type', 'application/json');
    pool.query('select * from wall_of_art', (err, dbres) => {
      if (err) return;
      data = dbres.rows;
      res.send(data);
    });
  });

  app.get('/getWallsHistory', function (req, res) {
    let data = [];
    res.set('Content-Type', 'application/json');
    pool.query('select * from wall_of_art_history', (err, dbres) => {
      if (err) return;
      data = dbres.rows;
      res.send(data);
    });
  });

  //Save image to database
  app.post('/saveImageToDatabase',function(req, res){
    console.log('Saving image to database...');
    res.set('Content-Type', 'application/json');
    //console.log(req.body.base64img);
    (async () => {
      // note: we don't try/catch this because if connecting throws an exception
      // we don't need to dispose of the client (it will be undefined)
      const client = await pool.connect()

      try {
        await client.query('BEGIN')
        const updateWallOfArtSql = `UPDATE wall_of_art SET canvas_number_${req.body.canvas_id}='${req.body.base64img}' `
        await client.query(updateWallOfArtSql)
        await client.query('COMMIT')
        res.send({
          status:'OK'
        })
      } catch (e) {
        await client.query('ROLLBACK')
        res.send({
          status:'ERROR'
        })
        throw e
      } finally {
        client.release()
      }
    })().catch(e => {
      console.error(e.stack);
      res.send({
        status:'ERROR'
      });
    });
  });

  //Save image to database
  app.post('/saveWallOfArt',function(req, res){
    console.log('Saving Wall of Art to database...');
    res.set('Content-Type', 'application/json');
    //console.log(req.body.base64img);
    (async () => {
      // note: we don't try/catch this because if connecting throws an exception
      // we don't need to dispose of the client (it will be undefined)
      const client = await pool.connect()

      try {
        await client.query('BEGIN')
        const insertWallOfArtSql = `INSERT INTO wall_of_art_history VALUES(${req.body.wall_of_art_version},'${req.body.base64img}'); `
                                  +`DELETE FROM wall_of_art; `
                                  +`INSERT INTO wall_of_art(wall_of_art_version) VALUES(${req.body.wall_of_art_version+1});`
        await client.query(insertWallOfArtSql)
        await client.query('COMMIT')
        res.send({
          status:'OK'
        })
      } catch (e) {
        await client.query('ROLLBACK')
        res.send({
          status:'ERROR'
        })
        throw e
      } finally {
        client.release()
      }
    })().catch(e => {
      console.error(e.stack);
      res.send({
        status:'ERROR'
      });
    });
  });

  // All remaining requests return the React app, so it can handle routing.
  app.get('*', function(request, response) {
    response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
  });

  app.listen(PORT, function () {
    console.error(`Node ${isDev ? 'dev server' : 'cluster worker '+process.pid}: listening on port ${PORT}`);
  });
}
