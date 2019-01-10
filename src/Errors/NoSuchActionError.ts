export class NoSuchActionError implements Error {
    success = false
    name = 'NoSuchActionError'
    message = 'No such action'
}