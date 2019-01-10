export interface IDDevice {
    genericName: string
    friendlyName: string
    deliverId: string
    supportedActions: Map<string, Function>
    serialize()
}