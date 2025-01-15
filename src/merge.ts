import { join } from '@tauri-apps/api/path';
import { writeFile } from '@tauri-apps/plugin-fs';
import { PDFDocument } from 'pdf-lib';

export async function mergePdf() {
    // const uploadArea1 = document.getElementById('upload-area-1');
    // const uploadArea2 = document.getElementById('upload-area-2');
    const fileInput1 = document.getElementById('file-input-1') as HTMLInputElement;
    const fileInput2 = document.getElementById('file-input-2') as HTMLInputElement;
    // const mergeButton = document.getElementById('merge-button');

    // let pdfFilePath1 = null;
    // let pdfFilePath2 = null;

    // read pdf files
    if (!fileInput1.files || !fileInput2.files) {
        throw new Error('Please select both PDF files.');
    }

    const pdfBytes1 = await fileInput1.files[0].arrayBuffer();
    const pdfBytes2 = await fileInput2.files[0].arrayBuffer();

    // merge pdf files
    const pdfDoc1 = await PDFDocument.load(pdfBytes1);
    const pdfDoc2 = await PDFDocument.load(pdfBytes2);
    const mergedPdf = await PDFDocument.create();

    const pages1 = await mergedPdf.copyPages(pdfDoc1, pdfDoc1.getPageIndices());
    const pages2 = await mergedPdf.copyPages(pdfDoc2, pdfDoc2.getPageIndices());

    pages1.forEach((page) => mergedPdf.addPage(page));
    pages2.forEach((page) => mergedPdf.addPage(page));

        // Save merged PDF
        const mergedPdfBytes = await mergedPdf.save();

        const outputFilePath = await join(await join('path', 'to'), 'merged_output.pdf');
        await writeFile(outputFilePath, mergedPdfBytes);

        alert(`PDFs merged successfully! File saved at: ${outputFilePath}`);
}
