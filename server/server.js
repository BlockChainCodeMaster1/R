/* eslint-disable no-console */
import express from 'express'
import next from 'next'
import logger from 'morgan'
import router from './router/router'
import bodyParser from 'body-parser'
import cookieParser from "cookie-parser"
import axios from "axios";
import schedule from "node-schedule"


const port = parseInt(process.env.PORT, 10) || 8199
const env = process.env.NODE_ENV
const dev = env !== 'production'
const app = next({
  dir: '.', // base directory where everything is, could move to src later
  dev,
})

const job = schedule.scheduleJob("*/30 * * * * *", async function () {
  await axios.get(`http://127.0.0.1:8199/api/update`);
  console.log('30s update' + new Date())
});

const handle = app.getRequestHandler()

let server
app
  .prepare()
  .then(() => {
      server = express()

      // Logs
      server.use(logger("dev"))

      // Router
      server.use(cookieParser())

      server.use(
        bodyParser.urlencoded({
          extended: true
        }),
      )
      server.use(bodyParser.json())
      
      router(server, handle)

      server.listen(port, (err) => {
          if (err) {
              throw err
          }
          console.log(`
        > Ready on port ${port} [${env}]
        http://localhost:8199
      `)
      })
  })
  .catch((err) => {
    console.log('An error occurred, unable to start the server')
    console.log(err)
  })