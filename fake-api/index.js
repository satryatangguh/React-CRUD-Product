const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { create, del, update, getAll, getByID } = require('./controller.js');

class Server {
  constructor() {
    this.port = 7777;
    this.app = express();
    this.api = express.Router();
  }

  crudController() {
    fs.readdir(path.join(__dirname, 'db'), (err, files) => {
      if (err) {
        return errLog('Unable to scan directory: ' + err);
      } else {
        files.forEach((file) => {
          const route = `/${file.replace(".json", "")}`;
          const routeByID = `${route}/:id`;
          const routeDelete = `${route}/delete/:id`;

          this.api.get(route, getAll);
          this.api.get(routeByID, getByID);
          this.api.post(route, create);
          this.api.put(routeByID, update);
          this.app.post(routeDelete, del);
        });
      }
    });
  };

  logger() {
    const typeLog = {
      err: chalk.red('[ERROR]'),
      ok: chalk.blue('[SUCCESS]'),
      notFound: chalk.yellow('[Not Found]')
    };
    global.logger = ({ type, route, ctx }) => {
      console.log(`${typeLog[type]} ${route} `, ctx);
    };
  };

  init() {
    const corsOptions = {
      origin: '*',
      methods: '*'
    }
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors(corsOptions));
    this.app.use('/', this.api);
    this.logger()

    this.crudController();

    this.app.listen(this.port, () => {
      console.log(`Server running on port:${this.port}`);
    });
  };
};

const server = new Server();
server.init();