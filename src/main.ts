import { BaseDirectory } from '@tauri-apps/api/path';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { PDFDocument } from 'pdf-lib';

const uploadArea1 = document.getElementById('upload-area-1') as HTMLDivElement;
    const uploadArea2 = document.getElementById('upload-area-2') as HTMLDivElement;
    const fileInput1 = document.getElementById('file-input-1') as HTMLInputElement;
    const fileInput2 = document.getElementById('file-input-2') as HTMLInputElement;
    const mergeButton = document.getElementById('merge-button') as HTMLButtonElement;
    let pdfFilePath1: any = null;
    let pdfFilePath2: any = null;

    function setupUploadArea(uploadArea: any, fileInput: any, setFilePathCallback: any) {
      console.log('uploadArea', uploadArea);
      console.log('fileInput', fileInput);
      console.log('setFilePathCallback:', setFilePathCallback);
      
      uploadArea.addEventListener('click', () => fileInput.click());
      uploadArea.addEventListener('dragover', (e: any) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
      });
      uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
      uploadArea.addEventListener('drop', (e: any) => {
        console.log('e:', e);
        
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFileSelection(e.dataTransfer.files[0], setFilePathCallback, uploadArea);
      });
      fileInput.addEventListener('change', (e: any) => {
        handleFileSelection(e.target.files[0], setFilePathCallback, uploadArea);
      });
    }

    async function handleFileSelection(file: any, setFilePathCallback: any, uploadArea: any) {
      console.log('file:', file);
      
      if (!file || file.type !== 'application/pdf') {
        alert('Please upload a valid PDF file.');
        return;
      }
      // setFilePathCallback(file.path || file.webkitRelativePath);
      setFilePathCallback(file);
      uploadArea.textContent = `Selected: ${file.name}`;
      updateMergeButtonState();
    }

    function updateMergeButtonState() {
      console.log('updateMergeButtonState:', pdfFilePath1 && pdfFilePath2);
      
      mergeButton.disabled = false;// !(pdfFilePath1 && pdfFilePath2);
    }

    async function mergePdfFiles() {
      try {
        const path = await save({
          filters: [
            {
              name: 'My Filter',
              extensions: ['pdf'],
            },
          ],
        });
        console.log(path);
  
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
        if (!path) {
          return;
        }
          await writeFile(path, mergedPdfBytes, { baseDir: BaseDirectory.AppLocalData});
  
          alert(`PDFs merged successfully! File saved at: ${path}`);
      } catch (error) {
        console.error('Error merging PDFs:', error);
        alert('Failed to merge PDFs. Check the console for more details.');
      }
    }

    setupUploadArea(uploadArea1, fileInput1, (filePath: any) => {
      console.log('filePath:', filePath);
      pdfFilePath1 = filePath;
    });
    setupUploadArea(uploadArea2, fileInput2, (filePath: any) => {
      console.log('filePath:', filePath);
      
      pdfFilePath2 = filePath;
    });
    mergeButton.addEventListener('click', mergePdfFiles);
