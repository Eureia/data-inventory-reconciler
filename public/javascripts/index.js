import * as XLSX from "xlsx";

// Lendo o arquivo XLSX de entrada
const workbook = XLSX.default.readFile("data_source.xlsx");

// Separando os nomes das abas de forma genérica
const tabName1 = workbook.SheetNames[0] || "Dataset1";
const tabName2 = workbook.SheetNames[1] || "Dataset2";
const tabName3 = workbook.SheetNames[2] || "Dataset3";

const sheetDataset1 = workbook.Sheets[tabName1];
const sheetDataset2 = workbook.Sheets[tabName2];
const sheetDataset3 = workbook.Sheets[tabName3];

/**
 * Agrega valores duplicados combinando as quantidades correspondentes ao mesmo Part Number (PN).
 */
function deduplicateEntries(entries) {
    const uniqueEntries = [];

    entries.forEach(x => {
        const hit = uniqueEntries.find(y => y.PN == x.PN);
        if (hit) {
            hit.QTT += x.QTT;
        } else {
            uniqueEntries.push(x);
        }
    });

    return uniqueEntries;
}

/**
 * Processa e compara dados de inventário/estoque entre duas origens de dados distintas dentro de uma aba.
 */
function processInventoryData(sheet, sourceARange, sourceBRange, sourceBLabel) {
    // Obtendo os dados brutos dos intervalos especificados
    const sourceARaw = XLSX.utils.sheet_to_json(sheet, { range: sourceARange });
    const sourceBRaw = XLSX.utils.sheet_to_json(sheet, { range: sourceBRange });

    // Mapeando chaves dinâmicas para propriedades padrão (PN e QTT)
    const sourceAEntries = sourceARaw.map(row => ({ 
        PN: Object.values(row)[0], 
        QTT: Object.values(row)[1] 
    }));
    
    const sourceBEntries = sourceBRaw.map(row => ({ 
        PN: Object.values(row)[0], 
        QTT: Object.values(row)[1] 
    }));

    // Removendo duplicatas locais e somando as quantidades de itens iguais
    const uniqueSourceA = deduplicateEntries(sourceAEntries);
    const uniqueSourceB = deduplicateEntries(sourceBEntries);

    const finalResult = [];

    // Cruzando dados: Procurando itens da Origem A na Origem B
    uniqueSourceA.forEach(x => {
        const hit = uniqueSourceB.find(y => y.PN == x.PN);

        let entry;
        if (hit) {
            entry = {
                partNumber: x.PN,
                location: 'Both',
                sourceAQuantity: x.QTT,
                sourceBQuantity: hit.QTT,
                divergent: x.QTT != hit.QTT ? '❌' : ''
            };
        } else {
            entry = {
                partNumber: x.PN,
                location: 'System A Only',
                sourceAQuantity: x.QTT,
                sourceBQuantity: NaN,
                divergent: '❌'
            };
        }
        finalResult.push(entry);
    });

    // Identificando itens que existem exclusivamente na Origem B
    uniqueSourceB.forEach(x => {
        const hit = finalResult.find(y => y.partNumber == x.PN);

        if (!hit) {
            const entry = {
                partNumber: x.PN,
                location: 'System B Only',
                sourceAQuantity: NaN,
                sourceBQuantity: x.QTT,
                divergent: '❌'
            };
            finalResult.push(entry);
        }
    });

    // Ordenando o resultado por localização e depois por Part Number
    finalResult.sort((first, second) => {
        return first.location.localeCompare(second.location) || first.partNumber.localeCompare(second.partNumber);
    });

    return finalResult;
}

// Executando o processamento por lotes de intervalos correspondentes
const resultBatch1 = processInventoryData(sheetDataset1, 'A2:B51', 'D2:E61', "Batch 1 Verification");
const resultBatch2 = processInventoryData(sheetDataset2, 'A2:B56', 'D2:E81', "Batch 2 Verification");
const resultBatch3 = processInventoryData(sheetDataset3, 'A2:B596', 'D2:E617', "Batch 3 Verification");

// Exibição dos resultados formatados em tabela no terminal
console.table(resultBatch1);
console.table(resultBatch2);
console.table(resultBatch3);

// Geração de saídas no formato CSV estruturado para logs
console.log([ Object.keys(resultBatch1[0]).join(','), ...resultBatch1.map(row => Object.values(row).join(',')) ].join('\n'));
console.log([ Object.keys(resultBatch2[0]).join(','), ...resultBatch2.map(row => Object.values(row).join(',')) ].join('\n'));
console.log([ Object.keys(resultBatch3[0]).join(','), ...resultBatch3.map(row => Object.values(row).join(',')) ].join('\n'));