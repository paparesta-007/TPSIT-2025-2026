function ParseQueryString(req: any, res: any, next: any) {
    req["parsedQueryString"] = {};
    if (typeof req["query"] == "object" && req["query"]) {
        for (const key in req["query"]) {
            let value = req["query"][key];
            req["parsedQueryString"][key] = ParseValue(value);
        }
    }
    next();
}

function ParseValue(value: any) {
    //booleani
    if (value == "true")
        return true;

    if (value == "false")
        return false;

    //numeri
    const num = Number(value);

    if (!isNaN(num))
        return num;
    //vettori o json
    if (value.startsWith("{") || value.startsWith("[")) {
        try {
            return JSON.parse(value);
        }
        catch (err) {
            return value;
        }
    }

    //se è una stringa non facciamo niente
    return value;
}

export default ParseQueryString;