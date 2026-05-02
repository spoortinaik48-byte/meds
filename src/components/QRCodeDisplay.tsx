import { QRCodeSVG } from 'qrcode.react';
import { Share2, Download } from 'lucide-react';

export default function QRCodeDisplay({ value }: { value: string }) {
  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'medvault-qr.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm w-full">
      <div className="bg-blue-50 p-4 rounded-2xl mb-4">
        <QRCodeSVG 
          id="qr-code-svg"
          value={value} 
          size={180} 
          includeMargin={true}
          className="rounded-lg"
        />
      </div>
      <p className="text-sm text-gray-500 font-medium mb-4">Scan to view records</p>
      <div className="flex space-x-3 w-full">
        <button 
          onClick={downloadQR}
          className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-200"
        >
          <Download size={18} />
          <span>Save QR</span>
        </button>
        <button className="flex items-center justify-center bg-blue-100 p-3 rounded-xl text-blue-600">
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
}
