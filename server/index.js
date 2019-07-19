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
    res.header("Access-Control-Allow-Origin", "http://earthswallofart.com");
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

  app.post('/getCanvases', function (req, res) {
    let data = {};
    res.set('Content-Type', 'application/json');
    pool.query(`select a.id,a.usernameid,b.username,a.canvasnumber,a.base64img, a.upvotes,a.downvotes `+
      `from users_drawings a, users b where a.usernameid = b.id and a.wall_of_art_version=${req.body.wallofartversion}`, (err, dbres) => {
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

  app.get('/getWallVersion', function (req, res) {
    let data = {};
    res.set('Content-Type', 'application/json');
    pool.query('select wall_of_art_version from wall_of_art_params', (err, dbres) => {
      if (err) return;
      data = dbres.rows;
      res.send(data);
    });
  });

  app.post('/login', function (req, res) {
    let data = [];
    res.set('Content-Type', 'application/json');
    pool.query(`select id,username from users where username=\'${req.body.username}\' and password=\'${req.body.password}\' ;`, (err, dbres) => {
      if (err) return;
      data = dbres.rows;
      res.send(data);
    });
  });

  app.post('/getUsernameId', function (req, res) {
    let data = [];
    res.set('Content-Type', 'application/json');
    pool.query(`select id from users where username=\'${req.body.username}\' ;`, (err, dbres) => {
      if (err) return;
      data = dbres.rows;
      res.send(data);
    });
  });

  app.post('/getDrawingMetaData', function (req, res) {
    let data = [];
    res.set('Content-Type', 'application/json');
    pool.query(`select upvotes,downvotes,b.username from users_drawings a , users b where a.usernameid = b.id and a.id=${req.body.drawingId};`, (err, dbres) => {
      if (err) return;
      data = dbres.rows;
      res.send(data);
    });
  });

  //Save image to database
  app.post('/saveImageToDatabase',function(req, res){
    console.log('Saving image to database...');
    res.set('Content-Type', 'application/json');
    (async () => {
      // note: we don't try/catch this because if connecting throws an exception
      // we don't need to dispose of the client (it will be undefined)
      const client = await pool.connect()

      try {
        await client.query('BEGIN')
        const insertIntoUserDrawings = `INSERT INTO users_drawings(usernameid,canvasnumber,base64img,wall_of_art_version) `
                                 + `VALUES(${req.body.usernameid},${req.body.canvas_id},'${req.body.base64img}',${req.body.wallofartversion});`;
        await client.query(insertIntoUserDrawings)
        await client.query('COMMIT')
        res.send({
          status:'OK'
        })
      } catch (e) {
        await client.query('ROLLBACK')
        throw e
        res.send({
          status:'ERROR'
        })
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
                                  +`UPDATE wall_of_art_params SET wall_of_art_version = ${req.body.wall_of_art_version+1} ;`
        await client.query(insertWallOfArtSql)
        await client.query('COMMIT')
        res.send({
          status:'OK'
        })
      } catch (e) {
        await client.query('ROLLBACK')
        throw e
        res.send({
          status:'ERROR'
        })
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
  app.post('/saveUsernameAndPassword',function(req, res){
    console.log('Saving username and password');
    res.set('Content-Type', 'application/json');
    //console.log(req.body.base64img);
    (async () => {
      // note: we don't try/catch this because if connecting throws an exception
      // we don't need to dispose of the client (it will be undefined)
      const client = await pool.connect()

      try {
        await client.query('BEGIN')
        const saveUserAndPassSql = `INSERT INTO users(username,password) VALUES('${req.body.username}','${req.body.password}'); `
        await client.query(saveUserAndPassSql)
        await client.query('COMMIT')
        res.send({
          status:'OK'
        })
      } catch (e) {
        await client.query('ROLLBACK')
        console.log(e.code);
        throw e
        if(e.code=='23505'){
          res.send({
            status:'ERROR',
            errorMsg:'Username already exists'
          })
        }else{
          res.send({
            status:'ERROR',
            errorMsg:'There was an error'
          })
        }
      } finally {
        client.release()
      }
    })().catch(e => {
      console.error(e.stack);
      if(e.code=='23505'){
        res.send({
          status:'ERROR',
          errorMsg:'Username already exists'
        })
      }else{
        res.send({
          status:'ERROR',
          errorMsg:'There was an error'
        })
      }
    });
  });

  app.post('/upvoteDrawing',function(req, res){
    res.set('Content-Type', 'application/json');
    console.log(req.body);
    //console.log(req.body.base64img);
    (async () => {
      // note: we don't try/catch this because if connecting throws an exception
      // we don't need to dispose of the client (it will be undefined)
      const client = await pool.connect()

      try {
        await client.query('BEGIN')
        const upvoteSQL = `update users_drawings set upvotes=upvotes+1 where id=${req.body.imgid} ;`
        +`INSERT INTO users_votes VALUES (${req.body.userid},${req.body.imgid},'U');`
        await client.query(upvoteSQL)
        await client.query('COMMIT')
        res.send({
          status:'OK'
        })
      } catch (e) {
        await client.query('ROLLBACK')
        throw e
        res.send({
          status:'ERROR'
        })
      } finally {
        client.release()
      }
    })().catch(e => {
      console.error(e.stack);
      if(e.code=='23505'){
        res.send({
          status:'ERROR',
          errorMsg:'Already voted'
        })
      }else{
        res.send({
          status:'ERROR',
          errorMsg:'There was an error'
        })
      }
    });
  });

  app.post('/downvoteDrawing',function(req, res){
    res.set('Content-Type', 'application/json');
    console.log(req.body);
    //console.log(req.body.base64img);
    (async () => {
      // note: we don't try/catch this because if connecting throws an exception
      // we don't need to dispose of the client (it will be undefined)
      const client = await pool.connect()

      try {
        await client.query('BEGIN')
        const downvoteSQL = `update users_drawings set downvotes=downvotes+1 where id=${req.body.imgid} ;`
        +`INSERT INTO users_votes VALUES (${req.body.userid},${req.body.imgid},'D');`
        await client.query(downvoteSQL)
        await client.query('COMMIT')
        res.send({
          status:'OK'
        })
      } catch (e) {
        await client.query('ROLLBACK')
        throw e
        res.send({
          status:'ERROR'
        })
      } finally {
        client.release()
      }
    })().catch(e => {
      console.error(e.stack);
      if(e.code=='23505'){
        res.send({
          status:'ERROR',
          errorMsg:'Already voted'
        })
      }else{
        res.send({
          status:'ERROR',
          errorMsg:'There was an error'
        })
      }
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
