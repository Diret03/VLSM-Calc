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

    // Ensure that the required data is available
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



function generateSubnetTable(majorNetwork, prefix, hosts) {
    // Get the table body
    const tableBody = document.querySelector('#subnetTable tbody');

    // Clear existing rows
    tableBody.innerHTML = '';

    // Function to add a row to the table
    function addRow(subnet) {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = subnet.name;
        row.insertCell(1).textContent = subnet.numHosts;
        row.insertCell(2).textContent = subnet.allocatedHosts;
        row.insertCell(3).textContent = subnet.binAddress;
        row.insertCell(4).textContent = subnet.address;
        row.insertCell(5).textContent = `/${subnet.prefix}`;
        row.insertCell(6).textContent = subnetMasks[subnet.prefix];
        row.insertCell(7).textContent = subnet.minHost;
        row.insertCell(8).textContent = subnet.maxHost;
        row.insertCell(9).textContent = subnet.broadcast;
    }

    // Your logic to generate subnets based on majorNetwork, prefix, and hosts
    const subnets = finalSubnets(majorNetwork, prefix, hosts);

    if (!subnets) {
        let data = document.getElementById('data');
        data.innerHTML = '<h2 style="color:red">Subneteo fallido!</h2>';

        return false;
    }

    // Populate the table with generated subnets
    subnets.forEach(subnet => {
        addRow(subnet);
    });
}

