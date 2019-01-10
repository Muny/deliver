import { App } from './app'
import * as fs from 'fs'

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))

new App(config).express.listen(config.httpServer.port, () => {
    console.log(`Listening for HTTP requests on port ${config.httpServer.port}...`)
})