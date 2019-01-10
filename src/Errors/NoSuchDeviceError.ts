export class NoSuchDeviceError implements Error {
    success = false
    name = 'NoSuchDeviceError'
    message = 'No such device'
}