import HttpMitmProxy, { IProxy } from 'http-mitm-proxy'
import * as fs from 'fs'

export class TuyaProxyImporter {
    proxy: IProxy
    
    constructor() {
        this.proxy = HttpMitmProxy()

        this.proxy.onError((ctx, err) => {
            console.error('proxy error: ', err)
        })

        this.proxy.onRequest((ctx, callback) => {

            if (['tuyacn.com', 'tuyaus.com', 'tuyaeu.com'].some((val) => {
                return ctx.clientToProxyRequest.headers.host.indexOf(val) >= 0
            }) && ctx.clientToProxyRequest.url.startsWith('/api.json')) {

                ctx.use(HttpMitmProxy.gunzip)

                let respBodyChunks = []

                ctx.onResponseData((ctx, chunk, callback) => {
                    respBodyChunks.push(chunk)
                    return callback(null, chunk)
                })

                ctx.onResponseEnd((ctx, callback) => {
                    let respBody = Buffer.concat(respBodyChunks).toString()

                    let respObj = JSON.parse(respBody)

                    if (respObj.result !== undefined && respObj.result.forEach !== undefined) {
                        respObj.result.forEach(result => {
                            if (result.a !== undefined) {
                                if (result.a == 'tuya.m.my.group.device.list') {
                                    if (result.success) {
                                        result.result.forEach(device => {
                                            console.log('found device:', device)
                                        })
                                    }
                                }
                            }
                        })
                    }

                    return callback()
                })
            }
            else if (ctx.clientToProxyRequest.headers.host == 'device.setup.proxy.deliver.notatld'
                && ctx.clientToProxyRequest.url == '/Delete-Me_Deliver_CA.pem') {
                ctx.proxyToClientResponse.setHeader('Content-Type', 'application/octet-stream')
                ctx.proxyToClientResponse.setHeader('Content-Disposition', 'attachment filename="Delete-Me_Deliver_CA.pem"')
                ctx.proxyToClientResponse.end(fs.readFileSync('.http-mitm-proxy/certs/ca.pem'))
            }

            return callback()
        })

        this.proxy.listen({ port: 8096 })
    }
}