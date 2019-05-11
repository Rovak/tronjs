export function hexChar2byte(c): number {
    let d = 0;

    if (c >= 'A' && c <= 'F')
        d = c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
    else if (c >= 'a' && c <= 'f')
        d = c.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
    else if (c >= '0' && c <= '9')
        d = c.charCodeAt(0) - '0'.charCodeAt(0);

    return d;
}

export function isHexChar(c): boolean {
    if ((c >= 'A' && c <= 'F') ||
        (c >= 'a' && c <= 'f') ||
        (c >= '0' && c <= '9')) {
        return true;
    }

    return false;
}

export function hexStr2byteArray(str: string): number[] {
    const byteArray = Array();
    let d = 0;
    let j = 0;
    let k = 0;

    for (let i = 0; i < str.length; i++) {
        const c = str.charAt(i);

        if (isHexChar(c)) {
            d <<= 4;
            d += hexChar2byte(c);
            j++;

            if (0 === (j % 2)) {
                byteArray[k++] = d;
                d = 0;
            }
        }
    }

    return byteArray;
}

export function byte2hexStr(byte): string {
    const hexByteMap = "0123456789ABCDEF";
    let str = "";

    str += hexByteMap.charAt(byte >> 4);
    str += hexByteMap.charAt(byte & 0x0f);

    return str;
}

export function byteArray2hexStr(byteArray): string {
    return byteArray.reduce((string, byte) => string + byte2hexStr(byte), '');
}
