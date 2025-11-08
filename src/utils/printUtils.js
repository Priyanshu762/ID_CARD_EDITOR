/**
 * Print utilities for ID cards
 * Maintains exact physical dimensions when printing on A4 paper
 */

/**
 * Convert pixels to millimeters (96 DPI standard)
 * @param {number} pixels - Pixel value
 * @returns {number} Millimeter value
 */
export const pxToMm = (pixels) => (pixels * 25.4) / 96;

/**
 * Convert millimeters to pixels (96 DPI standard)
 * @param {number} mm - Millimeter value
 * @returns {number} Pixel value
 */
export const mmToPx = (mm) => (mm * 96) / 25.4;

/**
 * Standard paper sizes in mm
 */
export const PAPER_SIZES = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  LETTER: { width: 215.9, height: 279.4 },
};

/**
 * Standard ID card size (CR80 standard)
 */
export const ID_CARD_SIZE = {
  width: 85.6, // mm
  height: 53.98, // mm
  widthPx: 323, // px at 96 DPI
  heightPx: 204, // px at 96 DPI
};

/**
 * Calculate how many cards can fit on a paper
 * @param {Object} cardSize - Card dimensions in mm {width, height}
 * @param {Object} paperSize - Paper dimensions in mm {width, height}
 * @param {number} margin - Margin in mm (default: 20)
 * @param {number} spacing - Spacing between cards in mm (default: 5)
 * @returns {Object} Layout information
 */
export const calculateCardLayout = (cardSize, paperSize = PAPER_SIZES.A4, margin = 20, spacing = 5) => {
  const printableWidth = paperSize.width - (2 * margin);
  const printableHeight = paperSize.height - (2 * margin);

  const cardsPerRow = Math.floor((printableWidth + spacing) / (cardSize.width + spacing));
  const cardsPerColumn = Math.floor((printableHeight + spacing) / (cardSize.height + spacing));

  const totalCards = cardsPerRow * cardsPerColumn;

  // Calculate actual spacing to center cards
  const totalCardWidth = cardsPerRow * cardSize.width;
  const totalHorizontalSpacing = (cardsPerRow - 1) * spacing;
  const horizontalOffset = (printableWidth - totalCardWidth - totalHorizontalSpacing) / 2;

  const totalCardHeight = cardsPerColumn * cardSize.height;
  const totalVerticalSpacing = (cardsPerColumn - 1) * spacing;
  const verticalOffset = (printableHeight - totalCardHeight - totalVerticalSpacing) / 2;

  return {
    cardsPerRow,
    cardsPerColumn,
    totalCards,
    horizontalOffset: margin + horizontalOffset,
    verticalOffset: margin + verticalOffset,
    spacing,
  };
};

/**
 * Generate print HTML with exact physical dimensions
 * @param {string} imageDataUrl - Canvas image data URL
 * @param {Object} canvasSize - Canvas dimensions {width, height} in pixels
 * @param {string} orientation - 'landscape' or 'portrait'
 * @param {number} copies - Number of copies to print (default: 1)
 * @returns {string} HTML content for printing
 */
export const generatePrintHTML = (imageDataUrl, canvasSize, orientation = 'landscape', copies = 1) => {
  const widthMm = pxToMm(canvasSize.width);
  const heightMm = pxToMm(canvasSize.height);

  const cardSize = { width: widthMm, height: heightMm };
  const layout = calculateCardLayout(cardSize);

  // Generate card elements
  const cardElements = Array.from({ length: copies }, (_, i) => `
    <div class="id-card" style="
      width: ${widthMm}mm;
      height: ${heightMm}mm;
      margin-bottom: ${i < copies - 1 ? layout.spacing : 0}mm;
      ${i % layout.cardsPerRow !== layout.cardsPerRow - 1 ? `margin-right: ${layout.spacing}mm;` : ''}
      ${i % layout.cardsPerRow === 0 && i > 0 ? `break-before: auto;` : ''}
    ">
      <img src="${imageDataUrl}" alt="ID Card ${i + 1}" style="width: 100%; height: 100%; display: block;" />
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Print ID Card - ${widthMm.toFixed(2)}mm × ${heightMm.toFixed(2)}mm</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 20mm;
          }
          
          @media print {
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .print-info, .print-button {
              display: none !important;
            }
            
            .print-container {
              padding: 0 !important;
              box-shadow: none !important;
              background: transparent !important;
            }
            
            .card-grid {
              display: flex;
              flex-wrap: wrap;
            }
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            background: #f5f5f5;
          }
          
          .print-info {
            background: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .print-info h2 {
            font-size: 20px;
            color: #1f2937;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 15px;
          }
          
          .info-item {
            background: #f9fafb;
            padding: 10px;
            border-radius: 6px;
          }
          
          .info-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          
          .info-value {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
          }
          
          .print-tip {
            background: #dbeafe;
            border-left: 4px solid #2563eb;
            padding: 12px;
            border-radius: 6px;
            margin-top: 15px;
          }
          
          .print-tip p {
            font-size: 13px;
            color: #1e40af;
            line-height: 1.5;
          }
          
          .print-button {
            background: #2563eb;
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
            transition: all 0.2s;
          }
          
          .print-button:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
            box-shadow: 0 6px 8px rgba(37, 99, 235, 0.4);
          }
          
          .print-button:active {
            transform: translateY(0);
          }
          
          .print-container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            display: inline-block;
          }
          
          .card-grid {
            display: flex;
            flex-wrap: wrap;
            gap: ${layout.spacing}mm;
          }
          
          .id-card {
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
            border-radius: 2px;
          }
        </style>
      </head>
      <body>
        <div class="print-info">
          <h2>
            <span style="font-size: 24px;">🖨️</span>
            ID Card Print Preview
          </h2>
          
          
          <button class="print-button" onclick="window.print()">
            <span style="font-size: 20px;">🖨️</span>
            <span>Print ID Card${copies > 1 ? 's' : ''}</span>
          </button>
        </div>
        
        <div class="print-container">
          <div class="card-grid">
            ${cardElements}
          </div>
        </div>
      </body>
    </html>
  `;
};

export default {
  pxToMm,
  mmToPx,
  PAPER_SIZES,
  ID_CARD_SIZE,
  calculateCardLayout,
  generatePrintHTML,
};
