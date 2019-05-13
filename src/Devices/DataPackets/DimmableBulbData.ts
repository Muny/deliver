import { DataPacket } from './DataPacket'

export interface DimmableBulbData extends DataPacket {
    state: boolean,
    brightness: number
}