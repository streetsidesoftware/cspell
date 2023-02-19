export function sayHello(name, log = false) {
    const msg = 'Hello ' + name;
    log && console.log(msg);
    return msg;
}
