const subnetMasks = {
    1: "128.0.0.0",
    2: "192.0.0.0",
    3: "224.0.0.0",
    4: "240.0.0.0",
    5: "248.0.0.0",
    6: "252.0.0.0",
    7: "254.0.0.0",
    8: "255.0.0.0",
    9: "255.128.0.0",
    10: "255.192.0.0",
    11: "255.224.0.0",
    12: "255.240.0.0",
    13: "255.248.0.0",
    14: "255.252.0.0",
    15: "255.254.0.0",
    16: "255.255.0.0",
    17: "255.255.128.0",
    18: "255.255.192.0",
    19: "255.255.224.0",
    20: "255.255.240.0",
    21: "255.255.248.0",
    22: "255.255.252.0",
    23: "255.255.254.0",
    24: "255.255.255.0",
    25: "255.255.255.128",
    26: "255.255.255.192",
    27: "255.255.255.224",
    28: "255.255.255.240",
    29: "255.255.255.248",
    30: "255.255.255.252"
};

document.addEventListener('DOMContentLoaded', function () {
    // Retrieve subnet information from localStorage
    const majorNetwork = localStorage.getItem('majorNetwork');
    const prefix = localStorage.getItem('prefix');
    const hosts = JSON.parse(localStorage.getItem('hosts'));

    // Asegurarse que la informacion se recolecto correctamente
    if (majorNetwork && prefix && hosts) {
        // Call a function to generate and populate the table

        // Update the #data section with major network and mask
        let majorNetElement = document.getElementById('majorNet');
        let maskElement = document.getElementById('mask');

        majorNetElement.textContent = `${majorNetwork} /${prefix}`;
        maskElement.textContent = `${subnetMasks[prefix]}`;

        generateSubnetTable(majorNetwork, parseInt(prefix), hosts);
    } else {
        console.error('Required data is missing from localStorage.');
    }
});

// Funcion para añadir una fila a la tabla
function addRow(subnet) {
    const tableBody = document.querySelector('#subnetTable tbody');
    const row = tableBody.insertRow();
    row.insertCell(0).textContent = subnet.name;
    row.insertCell(1).textContent = subnet.numRequiredHosts;
    row.insertCell(2).textContent = subnet.allocatedHosts;
    row.insertCell(3).textContent = subnet.binAddress;
    row.insertCell(4).textContent = subnet.address;
    row.insertCell(5).textContent = `/${subnet.prefix}`;
    row.insertCell(6).textContent = subnetMasks[subnet.prefix];
    row.insertCell(7).textContent = subnet.minHost;
    row.insertCell(8).textContent = subnet.maxHost;
    row.insertCell(9).textContent = subnet.broadcast;
}

function generateSubnetTable(majorNetwork, prefix, hosts) {
    // Get the table body
    const tableBody = document.querySelector('#subnetTable tbody');

    // Clear existing rows
    tableBody.innerHTML = '';



    // Your logic to generate subnets based on majorNetwork, prefix, and hosts
    const subnets = finalSubnets(majorNetwork, prefix, hosts);

    if (!subnets) {
        let data = document.getElementById('data');
        data.innerHTML = '<h2 style="color:red">Subneteo fallido!</h2>';

        return false;
    }

    //Llenar la tabla con las subredes generadas
    subnets.forEach(subnet => {
        addRow(subnet);
    });
}

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
            sub.numRequiredHosts = parseInt(hosts);
            sub.allocatedHosts = 2 ** hostBitsValue - 2;

            // if (sub.allocatedHosts > sub.ne) {

            // }
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
                    if (2 ** (numBitsHosts - 1) - 2 > hosts[index].numHosts) {   //asegurarse de no desperdiciar hosts con el tamaño actual
                        numBitsHosts--;
                        wasNumBitsChanged = true;
                    } else {
                        break;  //romper ciclo cuando se tenga la cantidad de bits de hosts optima
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
            //else break;
        }
    }

    return results;
}
