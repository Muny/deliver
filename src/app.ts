import * as express from 'express'
import * as bodyParser from 'body-parser'
import { Routes } from './Routes/Routes'
import { DeviceManager } from './Devices/DeviceManager'

export class App {
    public express: express.Application
    public ctrlRoutes: Routes = new Routes()
    public deviceManager: DeviceManager = new DeviceManager()
    public Config

    constructor(config) {
        this.Config = config
        this.express = express.default()
        this.config()
        this.ctrlRoutes.routes(this)
        this.deviceManager.importDevicesFromConfig(config.deliverDevices)
    }

    private config(): void {
        // application/json
        this.express.use(bodyParser.json())
        // application/x-www-form-urlencoded
        this.express.use(bodyParser.urlencoded({ extended: false }))
    }
}