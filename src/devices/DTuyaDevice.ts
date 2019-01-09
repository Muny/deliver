import * as TuyaDevice from 'tuyapi'
import { IDDevice } from './IDDevice';

export class DTuyaDevice implements IDDevice {
    genericName: string = 'Tuya Device';
    friendlyName: string;
    dID: string;

    ip: string;
    devId: string;
    localKey: string;

    _tuyaDev: TuyaDevice;

    dps: any;

    constructor(dID: string, friendlyName: string, ip: string, devId: string, localKey: string) {

        this.dID = dID;
        this.friendlyName = friendlyName;
        this.ip = ip;
        this.devId = devId;
        this.localKey = localKey;

        this._tuyaDev = new TuyaDevice.default({
            ip: ip,
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

            console.log(`[${friendlyName}] new dps:`, this.dps)
        })

        this._tuyaDev.connect()
    }

    toggle(params) {
        console.log('got params:', params)
        
        return new Promise((resolve, reject) => {
            this._tuyaDev.set({ set: !this.dps['1'] }).then((success: boolean) => {
                resolve({ success: success })
            })
        })
    }
}