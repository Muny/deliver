const fs = require('fs')
const TuyaDevice = require('tuyapi')



const http = require('http')
const port = 8032

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))

const TuyaDevices = {

}

for (const deviceName in config.devices) {
    const deviceConf = config.devices[deviceName];
    TuyaDevices[deviceName] = new TuyaDevice({
        ip: deviceConf.ip,
        id: deviceConf.id,
        key: deviceConf.localKey,
        persistentConnection: true
    })

    TuyaDevices[deviceName].on('connected', () => {
        console.log(`${deviceName} connected`)
    })

    TuyaDevices[deviceName].on('disconnected', () => {
        console.log(`${deviceName} disconnected`)
    })

    TuyaDevices[deviceName].on('error', (err) => {
        console.log(`${deviceName} error: `, err)
    })



    TuyaDevices[deviceName].connect();
}

const requestHandler = (request, response) => {
    console.log(`Received request for path: ${request.url}`)
    response.end('EHLO')

    const parts = request.url.split('/')
    const action = parts[1]

    console.log(`Action requested: ${action}`)

    switch (action)
    {
        case 'toggle':
            const deviceName = parts[2]
            const device = config.devices[deviceName];

            console.log(`Device: ${JSON.stringify(device)}`)

            /*setdps = spawn('tuya-cli', [
                'set',
                '--ip',
                device.ip,
                '--id',
                device.id,
                '--key',
                device.localKey,
                '--set',
                (!device.state).toString()
            ])

            setdps.on('close', (code) => {
                console.log(`command exited with code ${code}`)
                device.state = !device.state
            })*/

            TuyaDevices[deviceName].set({ set: !device.state }).then(() => {
                console.log('Set success')
                device.state = !device.state
            })

            break
    }
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('uh-oh', err)
    }

    console.log(`listening on port ${port}`)
})