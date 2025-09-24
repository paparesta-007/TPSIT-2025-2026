const PI = 3.14

class myClass {
    constructor() {}
    month = ["Gen", "Feb", "Mar"]
    sayHi(name) {
        return "Hi " + name
    }
}

let instance = new myClass();
let month  = instance.month;
let sayHi  = instance.sayHi;

export default instance;
export {PI, month, sayHi};

