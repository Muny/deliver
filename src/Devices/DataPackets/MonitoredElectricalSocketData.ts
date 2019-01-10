import { DataPacket } from "./DataPacket";

export interface MonitoredElectricalSocketData extends DataPacket {
    state: boolean,
    voltage: number,
    current: number
}