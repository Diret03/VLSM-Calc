
//clase subnet

class Subnet {
    constructor() {
        this.binAddress = '';
        this.address = '';
        this.prefix = 0;
        this.bitsHost = 0;
        this.numRequiredHosts = 0;
        this.allocatedHosts = 0;
        this.minHost = '';
        this.maxHost = '';
        this.broadcast = '';
    }

    toString() {
        return `Bin Address: ${this.binAddress} | Address: ${this.address} | Mask: /${this.prefix}`;
    }
}


document.getElementById('changeSubnet').addEventListener('click', function (event) {
    event.preventDefault();

    let numSubnets = document.getElementById('numSubnet').value;
    let table = document.getElementById('subnetTable');

    // Obtener el numero de filas actuales
    let currentRows = table.rows.length - 2;

    if (numSubnets <= 0) { //si el numero de subredes solicitado es menor o igual a cero...
        return; //no hacer nada
    } else {
        if (numSubnets == currentRows - 1) { //si el numero de subredes solicitado es igual al numero de filas...
            return; //no hacer nada
        } else {
            if (numSubnets < currentRows) { //si el numero de subredes solicitado es menor al numero actual de filas....
                let index = currentRows - 1;

                while (table.rows.length - 3 > numSubnets) {  //borrar las filas existentes hasta que su numero sea igual al numero de subredes
                    table.deleteRow(index);
                    index--;
                }

            } else { //si el numero de subredes solicitado es mayor al numero actual de filas....

                for (var i = currentRows; i <= numSubnets; i++) {
                    let row = table.insertRow(i); //empezar a colocar filas a partir de la ultima fila existente
                    let cell1 = row.insertCell(0);
                    let cell2 = row.insertCell(1);
                    cell1.innerHTML = '<input type="text" name="net_' + i + '" class="name" value="' + String.fromCharCode(65 + i - 1) + '">';
                    cell2.innerHTML = '<input type="number" name="size_' + i + '" class="size">';
                }
            }

        }
    }


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
    }

    // Comprobar que solo haya 4 octetos
    // if (octets.length !== 4) {
    //     alert('Una dirección IPv4 no tiene más de 4 octetos');
    //     return false;
    // }

    return isValid;

}

//recolectar hosts

document.getElementById('submit').addEventListener('click', function (event) {

    event.preventDefault();

    // recuperar red padre
    let majorNetwork = document.getElementById('majorNetwork').value;
    let prefix = document.getElementById('prefix').value;

    var majorNetTD = document.getElementById('majorNetTD');
    let errorMessage = document.createElement('p');
    errorMessage.classList.add('error');

    majorNetTD.innerHTML = `
        <input type="text" name="majorNetwork" id="majorNetwork"
        placeholder="Ingresar red padre" value='${majorNetwork}'/>
        <input type="number" name="prefix" id="prefix" placeholder="Prefijo de máscara" value='${prefix}' />
        `;


    // Verificar que el formato ingresado de la red sea correcto
    if (!isValidNetworkFormat(majorNetwork)) {
        // majorNetTD.innerHTML = `
        // <input type="text" name="majorNetwork" id="majorNetwork"
        // placeholder="Ingresar red padre" value='${majorNetwork}'/>
        // <input type="number" name="prefix" id="prefix" placeholder="Prefijo de máscara" value='${prefix}' />
        // `;
        majorNetTD.innerHTML += `<br>
        <p>Formato inválido de red. Por favor use el formato decimal *.*.*.*</p>
        `;
        // errorMessage.textContent = 'Formato inválido de red. Por favor use el formato decimal *.*.*.*';
        // majorNetTD.appendChild(errorMessage);
        return;
    }

    // Comprobar que el prefijo sea un número válido entre 1 y 32
    if (isNaN(prefix) || prefix < 1 || prefix > 32) {
        majorNetTD.innerHTML += `<br>
        <p>Prefijo inválido. Por favor use un número entre uno y 32.</p>

        `;
        return;
    }


    // almacenar nombres de los hosts y su valor
    const hosts = [];
    let hostRows = document.querySelectorAll('.name');
    let numHostsRows = document.querySelectorAll('.size');


    let errorRow = document.getElementById('errorRow');
    let errorMsgP = document.getElementById('errorMessage');


    // Comprobar si alguna input de tamano esta vacio 
    let isValid = true;
    errorMsgP.innerHTML = '';
    numHostsRows.forEach((numHostsInput, index) => {
        let hostName = hostRows[index].value;
        let numHosts = numHostsInput.value;

        if (numHosts.trim() === '') {
            isValid = false;
            //errorRow.innerHTML = `<td colspan=2>El tamaño del host '${hostName}' no puede estar vacío.</td>`;
            errorMsgP.innerHTML += `<td colspan=2>El tamaño del host '${hostName}' no puede estar vacío.</td><br>`;
        } else {
            if (numHosts <= 0) {
                isValid = false;
                // errorRow.innerHTML = `<td colspan=2>El host '${hostName}' debe ser mayor a 0.</td>`;
                errorMsgP.innerHTML += `<td colspan=2>El host '${hostName}' debe ser mayor a 0.</td><br>`;
            }
            else hosts.push({ name: hostName, numHosts: numHosts });
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


