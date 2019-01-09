import * as fs from 'fs'
import * as TuyaDevice from 'tuyapi'

import * as http from 'http'
const port = 8032

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))

const TuyaDevices = {

}

for (const deviceName in config.devices) {
    const deviceConf = config.devices[deviceName]

    const tuyaDev = new TuyaDevice.default({
        ip: deviceConf.ip,
        id: deviceConf.id,
        key: deviceConf.localKey,
        persistentConnection: true
    })

    tuyaDev.on('connected', () => {
        console.log(`${deviceName} connected`)
    })

    tuyaDev.on('disconnected', () => {
        console.log(`${deviceName} disconnected`)
    })

    tuyaDev.on('error', (err: Error) => {
        console.log(`${deviceName} error: `, err)
    })

    tuyaDev.connect()

    TuyaDevices[deviceName] = tuyaDev
}

const requestHandler = (request, response: http.ServerResponse) => {
    console.log(`Received request for path: ${request.url}`)

    const parts = request.url.split('/')
    const action = parts[1]

    console.log(`Action requested: ${action}`)

    switch (action)
    {
        case 'toggle':
            const deviceName = parts[2]
            const device = config.devices[deviceName]

            TuyaDevices[deviceName].set({ set: !device.state }).then(() => {
                console.log(`Toggled ${deviceName}`)
                device.state = !device.state

                response.end(JSON.stringify({
                    success: true,
                    newState: device.state,
                    message: 'State toggle (probably) successful.'
                }))
            })
            break
        default:
            response.end(JSON.stringify({
                success: false,
                message: 'No action'
            }))
    }
}

const server = http.createServer(requestHandler)

server.listen(port, (err: Error) => {
    if (err) {
        return console.log('HTTP server error:', err)
    }

    console.log(`Listening for HTTP requests on port ${port}`)
})