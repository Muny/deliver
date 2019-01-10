import { DataPacket } from "./DataPacket";

export interface MonitoredElectricalSocketData extends DataPacket {
    state: boolean,
    timer: number,
    voltage: number,
    current: number,
    power: number
}