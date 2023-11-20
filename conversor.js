function decimalToBinary(decimalStr) {
    let num = parseInt(decimalStr, 10);
    let arr = new Array(8).fill(0);
    let count = 0;

    for (let i = arr.length - 1; i >= 0; i--) {
        arr[count] = 2 ** i;
        count++;
    }

    let str = "";

    for (let i = 0; i < arr.length; i++) {
        if (num >= arr[i]) {
            str += '1';
            num -= arr[i];
        } else {
            str += '0';
        }
    }

    return str;
}

function binaryToDecimal(binary) {
    let ans = 0;

    for (let i = 0; i < binary.length; i++) {
        let bit = binary.charAt(i);
        if (bit === '1') {
            ans += 2 ** (binary.length - 1 - i);
        }
    }

    return String(ans);
}

// Convertir dirección decimal a binario
function addressToBinary(address) {
    let ans = "";

    const octets = address.split(".");

    for (let i = 0; i < octets.length; i++) {
        ans += decimalToBinary(octets[i]) + ".";
    }

    return ans.substring(0, ans.length - 1);
}

// Convertir dirección binaria a decimal
function binaryToDecimalAddress(binaryAdd) {
    let ans = "";

    const octets = binaryAdd.split(".");

    for (let i = 0; i < octets.length; i++) {
        ans += binaryToDecimal(octets[i]) + ".";
    }

    return ans.substring(0, ans.length - 1);
}