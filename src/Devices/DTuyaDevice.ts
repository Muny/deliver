import * as TuyaDevice from 'tuyapi'
import { IDDevice } from './IDDevice'
import { DataPacket } from './DataPackets/DataPacket'
import { MonitoredElectricalSocketData } from './DataPackets/MonitoredElectricalSocketData'

enum DTuyaDeviceType {
    Unknown,
    Electrical_Socket
}

export class DTuyaDevice implements IDDevice {
    genericName: string = 'Tuya Device'
    friendlyName: string
    deliverId: string

    tuyaProductId: string
    dTuyaDeviceType: DTuyaDeviceType
    devId: string
    localKey: string

    _tuyaDev: TuyaDevice

    dps: any
    parsedDps: DataPacket

    constructor(deliverId: string, friendlyName: string, tuyaProductId: string, devId: string, localKey: string) {

        this.deliverId = deliverId
        this.friendlyName = friendlyName

        this.tuyaProductId = tuyaProductId
        this.devId = devId
        this.localKey = localKey

        this.identifyDTuyaDeviceType()

        this._tuyaDev = new TuyaDevice.default({
            id: devId,
            key: localKey,
            persistentConnection: true
        })

        this._tuyaDev.on('connected', () => {
            console.log(`[${friendlyName}] connected`)
        })

        this._tuyaDev.on('disconnected', () => {
            console.log(`[${friendlyName}] disconnected`)
        })

        this._tuyaDev.on('error', (err: Error) => {
            console.log(`[${friendlyName}] error: `, err)
        })

        this._tuyaDev.on('data', (dat) => {
            this.dps = { ...this.dps, ...dat.dps }
            this.parsedDps = this.parseDps(this.dps)

            console.log(`[${friendlyName}] new parsed dps:`, this.parsedDps)
        })

        this._tuyaDev.resolveId().then((ipFound: boolean) => {
            if (ipFound)
                this._tuyaDev.connect()
            else
                console.error(`[${friendlyName}] unable to resolve IP address for device, can't connect`)
        })
    }

    identifyDTuyaDeviceType() {
        switch (this.tuyaProductId) {
            case 'IVgPyZR1c2OyLlyA':
                this.dTuyaDeviceType = DTuyaDeviceType.Electrical_Socket
                break
            default:
                this.dTuyaDeviceType = DTuyaDeviceType.Unknown
        }
    }

    parseDps(dps): DataPacket {
        switch (this.dTuyaDeviceType) {
            case DTuyaDeviceType.Electrical_Socket:
                let typedDps : MonitoredElectricalSocketData = {
                    state: dps['1'],
                    timer: dps['2'],
                    voltage: dps['6'] / 10,
                    current: dps['4'] / 1000,
                    power: dps['5'] / 10
                }
                return typedDps
                break
            default:
                return dps
        }
    }

    // TODO: manage this Map dynamically based on Tuya device type...
    supportedActions = new Map([
        [
            'toggle',
            (params) => {
                return new Promise((resolve, reject) => {
                    let newState: boolean = !this.dps['1']

                    this._tuyaDev.set({ set: newState }).then((success: boolean) => {
                        resolve({ success: success, data: { newParsedDps: this.parseDps({ ...this.dps, '1': newState }) } })
                    })
                })
            }
        ]
    ])

    serialize() {
        return {
            deliverId: this.deliverId,
            dTuyaDeviceType: this.dTuyaDeviceType,
            devId: this.devId,
            dps: this.dps,
            friendlyName: this.friendlyName,
            genericName: this.genericName,
            localKey: this.localKey,
            parsedOps: this.parsedDps,
            supportedActions: Array.from(this.supportedActions.keys()),
            tuyaProductId: this.tuyaProductId
        }
    }
}