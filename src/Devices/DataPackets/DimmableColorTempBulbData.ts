import { DataPacket } from './DataPacket'

export interface DimmableColorTempBulbData extends DataPacket {
    state: boolean,
    brightness: number,
    colorTemp: number
}