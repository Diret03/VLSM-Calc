
//clase subnet

class Subnet {
    constructor() {
        this.binAddress = '';
        this.address = '';
        this.prefix = 0;
        this.bitsHost = 0;
        this.numHosts = 0;
        this.allocatedHosts = 0;
        this.minHost = '';
        this.maxHost = '';
        this.broadcast = '';
    }

    toString() {
        return `Bin Address: ${this.binAddress} | Address: ${this.address} | Mask: /${this.prefix}`;
    }
}


//numero de filas de subredes

document.getElementById('changeSubnet').addEventListener('click', function () {
    var numSubnets = document.getElementById('numSubnet').value;

    // Clear existing rows
    var table = document.getElementById('subnetTable');
    let index = 0;
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Generate new rows
    for (var i = 1; i <= numSubnets; i++) {
        let row = table.insertRow(-1);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        cell1.innerHTML = '<input type="text" name="net_' + i + '" class="name" value="' + String.fromCharCode(65 + i - 1) + '">';
        cell2.innerHTML = '<input type="text" name="size_' + i + '" class="size">';
    }

    let row = table.insertRow(-1);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);


    cell1.innerHTML = '<td>Numero de subredes</td>';
    cell2.innerHTML = '<td><input type="number" name="" id="numSubnet" value="' + numSubnets + '"><button id="changeSubnet">Cambiar</button></td>';


});


function isValidNetworkFormat(network) {
    const networkFormatRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const octets = network.split('.');
    let isValid = false;

    if (networkFormatRegex.test(network)) {
        isValid = true;

        // Comprobar si cada octeto es valido
        for (const octet of octets) {
            const numericValue = parseInt(octet, 10);
            if (isNaN(numericValue) || numericValue < 0 || numericValue > 255) {
                alert('Un octeto debe ser un un número entre 0 y 255');
                isValid = false;
                return false;
            }
        }

        isValid = true;

    } else {
        isValid = false;
        alert('Formato inválido de red. Por favor use el formato decimal *.*.*.*');
    }

    // Comprobar que solo haya 4 octetos
    // if (octets.length !== 4) {
    //     alert('Una dirección IPv4 no tiene más de 4 octetos');
    //     return false;
    // }

    return isValid;

}

//recolectar hosts

document.getElementById('submit').addEventListener('click', function () {


    // recuperar red padre
    let majorNetwork = document.getElementById('majorNetwork').value;
    let prefix = document.getElementById('prefix').value;

    // Verificar que el formato ingresado de la red sea correcto
    if (!isValidNetworkFormat(majorNetwork)) {
        return;
    }

    // Comprobar que el prefijo sea un número válido entre 1 y 32
    if (isNaN(prefix) || prefix < 1 || prefix > 32) {
        alert('Prefijo inválido. Por favor use un número entre uno y 32.');
        return;
    }


    // almacenar nombres de los hosts y su valor
    const hosts = [];
    let hostRows = document.querySelectorAll('.name');
    let numHostsRows = document.querySelectorAll('.size');

    // Check if any 'size' input is empty
    let isValid = true;
    numHostsRows.forEach((numHostsInput, index) => {
        let hostName = hostRows[index].value;
        let numHosts = numHostsInput.value;

        if (numHosts.trim() === '') {
            isValid = false;
            alert(`El tamaño del host '${hostName}' no puede estar vacío.`);
        } else {
            hosts.push({ name: hostName, numHosts: numHosts });
        }
    });

    // Continuar solo si todos los input de 'size' son validos
    if (!isValid) {
        return;
    }
    // Ordenar los hosts de mayor a menor tamaño
    hosts.sort((a, b) => b.numHosts - a.numHosts);

    //Almacenar la red padre y hosts en localStorage
    localStorage.setItem('majorNetwork', majorNetwork);
    localStorage.setItem('prefix', prefix);
    localStorage.setItem('hosts', JSON.stringify(hosts));

    window.location.href = 'subnetting.html';

});


//Function para calcular el número de hosts requeridos
function hostBits(hosts) {
    let exp = 0;

    while (Math.pow(2, exp) - 2 < hosts) {
        exp++;
    }

    return exp;
}



//Función recursiva para generar n combinaciones de números binarios
function generateBinaryCombinations(n) {
    const arr = [];
    generateBinaryCombinationsHelper(n, "", arr);
    return arr;
}

function generateBinaryCombinationsHelper(n, prefix, arr) {
    if (n === 0) {
        arr.push(prefix);
    } else {
        generateBinaryCombinationsHelper(n - 1, prefix + "0", arr);
        generateBinaryCombinationsHelper(n - 1, prefix + "1", arr);
    }
}


//función para reemplazar una porción de string dentro de otra a partir de un índice inicial
function replaceSubstring(base, newString, index) {
    const baseArray = base.split('');
    const newArray = newString.split('');

    for (let i = 0; i < newString.length;) {
        if (baseArray[index + i] !== '.') {
            baseArray[index + i] = newArray[i];
            i++;
        } else {
            index++;
        }
    }

    return baseArray.join('');
}

//función para reemplazar una combinación en binario dentro de una dirección binaria
function replaceCombination(ipAddress, newString, prefixLength) {
    const arrStrNoDots = ipAddress.split('.');
    let strNoDots = '';

    for (let i = 0; i < arrStrNoDots.length; i++) {
        strNoDots += arrStrNoDots[i];
    }

    const ans = replaceSubstring(strNoDots, newString, prefixLength - 1);
    const ipAddressWithDots = [];

    for (let i = 0; i < ans.length; i += 8) {
        ipAddressWithDots.push(ans.slice(i, i + 8));

        if (i + 8 < ans.length) {
            ipAddressWithDots.push('.');
        }
    }

    return ipAddressWithDots.join('');
}


//función para generar subredes en base a una dirección decimal, su prefijo de mácara y el número de hosts necesarios
function generateSubnets(majorAdd, prefix, hosts) {
    let hostBitsValue = hostBits(hosts);
    let netBits = 32 - prefix - hostBitsValue;
    if (netBits < 0) {

        return false;
    } else {

        const bitCombinations = generateBinaryCombinations(netBits);

        const subnets = [];

        let bitToStart = prefix + 1;
        prefix += netBits;

        for (let i = 0; i < 2 ** netBits; i++) {
            let ipAddress = addressToBinary(majorAdd);

            let sub = new Subnet();
            sub.binAddress = replaceCombination(ipAddress, bitCombinations[i], bitToStart);
            sub.address = binaryToDecimalAddress(sub.binAddress);
            sub.prefix = prefix;
            sub.bitsHost = hostBitsValue;
            sub.numHosts = hosts;
            sub.allocatedHosts = 2 ** hostBitsValue - 2;

            const hostCombinations = generateBinaryCombinations(sub.bitsHost);

            sub.minHost = binaryToDecimalAddress(replaceCombination(sub.binAddress, hostCombinations[1], prefix + 1));
            sub.maxHost = binaryToDecimalAddress(replaceCombination(sub.binAddress, hostCombinations[hostCombinations.length - 2], prefix + 1));
            sub.broadcast = binaryToDecimalAddress(replaceCombination(sub.binAddress, hostCombinations[hostCombinations.length - 1], prefix + 1));

            subnets.push(sub);
        }

        return subnets;
    }

}

//función para generar subredes en base a una dirección decimal, su prefijo de mácara y un arreglo de hosts ordenados de mayor a menor
function finalSubnets(majorAdd, prefix, hosts) {

    let index = 0;
    const results = [];
    const unasignedSubnets = [];

    while (results.length < hosts.length) {
        let subnetting = null;

        const numHosts = hosts[index].numHosts;

        if (!results.length) {
            subnetting = generateSubnets(majorAdd, prefix, numHosts);
            if (!subnetting) {

                return false;
            }

        } else {
            if (unasignedSubnets.length) {
                let auxSubnet = unasignedSubnets[0];
                subnetting = generateSubnets(auxSubnet.address, auxSubnet.prefix, numHosts);
                unasignedSubnets.shift();
            } else {
                results.push(null);
                break;
            }
        }

        for (let i = 0; i < subnetting.length; i++) {
            let current = subnetting[i];
            let numBitsHosts = current.bitsHost;

            if (index < hosts.length && 2 ** numBitsHosts - 2 >= hosts[index].numHosts) {
                let wasNumBitsChanged = false;

                while (2 ** numBitsHosts - 2 > hosts[index].numHosts) {
                    if (2 ** (numBitsHosts - 1) - 2 > hosts[index].numHosts) {
                        numBitsHosts--;
                        wasNumBitsChanged = true;
                    } else {
                        break;
                    }
                }

                if (!wasNumBitsChanged) {
                    current.name = hosts[index].name;
                    results.push(current);
                    index++;
                } else {
                    if (unasignedSubnets.length === 0) {
                        unasignedSubnets.push(...subnetting.slice(i));
                    } else {
                        unasignedSubnets.unshift(current);
                    }
                    break;
                }
            }
        }
    }

    return results;
}
