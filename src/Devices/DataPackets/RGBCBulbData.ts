import { DataPacket } from './DataPacket'

export interface RGBCBulbData extends DataPacket {
    state: boolean,
    color: string,
    brightness: number
}