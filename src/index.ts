import * as fs from 'fs'

import * as http from 'http'
import { DTuyaDevice } from './Devices/DTuyaDevice'
import { IDDevice } from './Devices/IDDevice'
import { TuyaProxyImporter } from './DeviceImporters/TuyaProxyImporter'

const mitmproxy = new TuyaProxyImporter()

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
                deviceConf.tuyaProductId,
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

// Still probably a better way to do this...
class ExtendedResponse {
    response: http.ServerResponse

    constructor(response: http.ServerResponse) {
        this.response = response
    }

    end(cb) {
        this.response.end(cb)
    }

    noAction() {
        this.fail('No action')
    }
    
    fail(message: string) {
        this.response.end(JSON.stringify({
            success: false,
            message: message
        }))
    }
}

const requestHandler = (request: http.IncomingMessage, _resp: http.ServerResponse) => {
    let response = new ExtendedResponse(_resp)

    console.log(`Received request for path: ${request.url}`)

    let bodyChunks = []

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
                const DDevice: IDDevice = DDevices[parts[2]]

                if (DDevice !== undefined) {
                    const action = parts[3]

                    if (DDevice[action] !== undefined) {
                        let params = {}
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
                        response.fail(`No such action '${action}' on device of type '${DDevice.genericName}'`)
                    }
                } else {
                    response.fail('Unknown device ID')
                }
                break
            default:
                response.fail('Unknown specifier')
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