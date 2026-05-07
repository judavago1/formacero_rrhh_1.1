const fs = require('fs');
const PDFParse = require('pdf-parse');

async function extractPDF() {
  try {
    const pdfPath = 'C:\\Users\\Carmo\\Downloads\\Tabla de Contenido Proyecto GradoV3 FORMACERO.pdf';
    const dataBuffer = fs.readFileSync(pdfPath);
    
    const data = await PDFParse(dataBuffer);
    
    console.log('=== PDF EXTRACTION COMPLETE ===');
    console.log(`Total Pages: ${data.numpages}`);
    console.log('\n=== CONTENT ===\n');
    console.log(data.text);
    
  } catch (error) {
    console.error('Error extracting PDF:', error.message);
  }
}

extractPDF();
