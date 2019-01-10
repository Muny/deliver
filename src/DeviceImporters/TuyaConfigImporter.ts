import { DTuyaDevice } from '../Devices/DTuyaDevice'

export class TuyaConfigImporter {
    static ImportOne(conf): DTuyaDevice {
        return new DTuyaDevice(
            conf.deliverId,
            conf.friendlyName,
            conf.tuyaProductId,
            conf.devId,
            conf.localKey
        )
    }
}