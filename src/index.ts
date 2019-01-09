import * as fs from 'fs'

import * as http from 'http'
import { spawn } from 'child_process';
import { DTuyaDevice } from './devices/DTuyaDevice';
import { IDDevice } from './devices/IDDevice';

const port = 8032

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))

const DDevices: Map<string, IDDevice> = new Map()

for (const dID in config.DDevices) {
    const deviceConf = config.DDevices[dID]

    let newDDevice: IDDevice

    switch (deviceConf.type)
    {
        case 'DTuyaDevice':
            newDDevice = new DTuyaDevice(
                dID,
                deviceConf.friendlyName,
                deviceConf.ip,
                deviceConf.devId,
                deviceConf.localKey
            )
            break
        default:
            // TODO: error?
    }

    if (newDDevice !== undefined) {
        DDevices[dID] = newDDevice
    }
}

class ServerResponse extends http.ServerResponse {
    noAction() {
        this.fail('No action')
    }
    
    fail(message: string) {
        this.end(JSON.stringify({
            success: false,
            message: message
        }))
    }
}

const requestHandler = (request: http.IncomingMessage, response: ServerResponse) => {
    console.log(`Received request for path: ${request.url}`)

    let bodyChunks = [];

    request.on('data', (chunk) => {
        bodyChunks.push(chunk)
    })

    request.on('end', () => {

        let body = Buffer.concat(bodyChunks).toString()

        const parts = request.url.split('/')
        const specifier = parts[1]

        console.log('Specifier:', specifier)

        switch (specifier) {
            case 'by-id':
                const DDevice: IDDevice = DDevices[parts[2]];

                if (DDevice !== undefined) {
                    const action = parts[3];

                    if (DDevice[action] !== undefined) {
                        let params = {};
                        if (body != '') {
                            params = JSON.parse(body)
                        }
                        
                        DDevice[action](params).then((result) => {
                            response.end(JSON.stringify({
                                success: result.success,
                                data: result.data
                            }))
                        })
                    } else {
                        response['fail'](`No such action '${action}' on device of type '${DDevice.genericName}'`)
                    }
                } else {
                    response['fail']('Unknown device ID')
                }
                break
            default:
                response['fail']('Unknown specifier')
                break
        }
    })
}

const server = http.createServer(requestHandler)

server.listen(port, (err: Error) => {
    if (err) {
        return console.log('HTTP server error:', err)
    }

    console.log(`Listening for HTTP requests on port ${port}`)
})