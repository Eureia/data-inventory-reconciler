import * as XLSX from "xlsx";

// Lendo o arquivo XLSX
const workbook = XLSX.default.readFile("sheet.xlsx");

// Separando as abas "RESERVA VENDAS", "COMERCIAL" e "VENDAS"
const reservaVendas = workbook.SheetNames[0];
const comercial = workbook.SheetNames[1];
const vendas = workbook.SheetNames[2];

const sheet1 = workbook.Sheets[sheetName1];
const sheet2 = workbook.Sheets[sheetName2];
const sheet3 = workbook.Sheets[sheetName3];

function deduplicateEntries(entries) {

    const uniqueEntries = [];

    entries.forEach(x => {
        const hit = uniqueEntries.find(y => y.PN == x.PN);
        if (hit) {
            hit.QTT += x.QTT;
        }
        else {
            uniqueEntries.push(x);
        }
    });

    return uniqueEntries;
}


function processesData(sheet, omieRange, warehouseRange, warehouseName) {
    // Obtendo os dados "crus" dos intervalos A2:A51 e D2:D61
    const omiePnsRaw = XLSX.utils.sheet_to_json(sheet, { range: omieRange });
    const ericPnsRaw = XLSX.utils.sheet_to_json(sheet, { range: warehouseRange });

    // Obtendo os valores dos objetos e criando um novo array
    const omieEntries = omiePnsRaw.map(row => ({ PN: Object.values(row)[0], QTT: Object.values(row)[1] }));
    const warehouseEntries = ericPnsRaw.map(row => ({ PN: Object.values(row)[0], QTT: Object.values(row)[1] }));
    // console.log(omiePns);
    // console.log(ericPns);

    // Removendo as possiveis duplicatas, agregando os valores de quantidade.
    const uniqueOmie = deduplicateEntries(omieEntries);
    const uniqueWarehouse = deduplicateEntries(warehouseEntries);

    const finalResult = [];

    uniqueOmie.forEach(x => {
        const hit = uniqueWarehouse.find(y => y.PN == x.PN);

        let entry;
        if (hit) {
            entry = ({
                partNumber: x.PN,
                location: 'Ambos',
                omieQuantity: x.QTT,
                warehouseQuantity: hit.QTT,
                divergent: x.QTT != hit.QTT ? '❌' : ''
            });
        } else {
            entry = ({
                partNumber: x.PN,
                location: 'Omie',
                omieQuantity: x.QTT,
                warehouseQuantity: NaN,
                divergent: '❌'
            });
        }
        finalResult.push(entry);
    });

    uniqueWarehouse.forEach(x => {
        const hit = finalResult.find(y => y.partNumber == x.PN);

        if (!hit) {
            const entry = ({
                partNumber: x.PN,
                location: 'Warehouse',
                omieQuantity: NaN,
                warehouseQuantity: x.QTT,
                divergent: '❌'
            });
            finalResult.push(entry);
        };
    });

    finalResult.sort((first, second) => {
        first.location.localeCompare(second.location) || first.partNumber.localeCompare(second.partNumber);
    });

    return finalResult;
};

const x1 = processesData(sheetReservaVendas, 'A2:B51', 'D2:E61', "Eric Reserva");
const x2 = processesData(sheetComercial, 'A2:B56', 'D2:E81', "Eric Comercial");
const x3 = processesData(sheetVendas, 'A2:B596', 'D2:E617', "WMS Vendas");

console.table(x1);
console.table(x2);
console.table(x3);

console.log([ Object.keys(x1[0]).join(','), ...x1.map(row => Object.values(row).join(',')) ].join('\n'));
console.log([ Object.keys(x2[0]).join(','), ...x2.map(row => Object.values(row).join(',')) ].join('\n'));
console.log([ Object.keys(x3[0]).join(','), ...x3.map(row => Object.values(row).join(',')) ].join('\n'));