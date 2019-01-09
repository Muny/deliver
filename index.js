const { spawn } = require('child_process')
const fs = require('fs')

const http = require('http')
const port = 8032

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))

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

            setdps = spawn('tuya-cli', [
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