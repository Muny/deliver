import { Request, Response } from 'express'
import { App } from '../app'
import { NoSuchDeviceError } from '../Errors/NoSuchDeviceError'
import { IDDevice } from'../Devices/IDDevice'
import { NoSuchActionError } from '../Errors/NoSuchActionError';

export class Routes {
    public routes(app: App): void {
        app.express.route('/')
        .get((req: Request, res: Response) => {
            res.status(200).send({
                message: 'greetings'
            })
        })
        
        app.express.route('/devices')
        .get((req: Request, res: Response) => {
            let devicesObj = {}

            app.deviceManager.Devices.forEach((val, key) => {
                devicesObj[key] = val.serialize()
            })

            res.send(devicesObj)
        })

        app.express.route('/devices/by-id/:deviceId')
        .get((req: Request, res: Response) => {
            if (app.deviceManager.Devices.has(req.params.deviceId)) {
                res.send({
                    success: true,
                    ...app.deviceManager.Devices.get(req.params.deviceId).serialize()
                })
            } else {
                res.send(new NoSuchDeviceError())
            }
        })

        app.express.route('/devices/by-id/:deviceId/:action')
        .put((req: Request, res: Response) => {
            if (app.deviceManager.Devices.has(req.params.deviceId)) {
                let device = app.deviceManager.Devices.get(req.params.deviceId)

                if (device.supportedActions.has(req.params.action)) {
                    device.supportedActions.get(req.params.action)(req.body).then((result) => {
                        res.send(result)
                    })
                } else {
                    res.send(new NoSuchActionError())
                }
            } else {
                res.send(new NoSuchDeviceError())
            }
        })
    }
}