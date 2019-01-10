import { IDDevice } from './IDDevice';
import { DTuyaDevice } from './DTuyaDevice';
import { TuyaConfigImporter } from '../DeviceImporters/TuyaConfigImporter';

export class DeviceManager {
    Devices: Map<string, IDDevice> = new Map()

    importDevicesFromConfig = (deviceConfigs) => {
        for (const deliverId in deviceConfigs) {
            const deviceConf = deviceConfigs[deliverId]

            let newDDevice: IDDevice

            switch (deviceConf.type) {
                case 'DTuyaDevice':
                    newDDevice = TuyaConfigImporter.ImportOne({ 'deliverId': deliverId, ...deviceConf })
                    break
                default:
                // TODO: error?
            }

            if (newDDevice !== undefined) {
                this.Devices.set(deliverId, newDDevice)
            }
        }
    }
}