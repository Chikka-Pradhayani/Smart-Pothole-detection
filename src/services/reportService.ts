
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Generates an high-resolution professional multi-page PDF report.
 */
export const generatePDFReport = async (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found.`);
  }

  // Optimize for professional PDF capture with improved scale and stability
  const canvas = await html2canvas(element, {
    scale: 2, // 2 is usually stable and sharp enough for A4. Higher can crash browser.
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    onclone: (clonedDoc) => {
      const clonedElement = clonedDoc.getElementById(elementId);
      if (clonedElement) {
        clonedElement.style.padding = '40px';
        clonedElement.style.margin = '0';
        clonedElement.style.borderRadius = '0';
        clonedElement.style.boxShadow = 'none';
        clonedElement.style.border = 'none';
      }
    }
  });

  const imgData = canvas.toDataURL('image/jpeg', 1.0);
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = pdfWidth;
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  // Additional pages if needed
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }
  
  pdf.save(filename);
};
