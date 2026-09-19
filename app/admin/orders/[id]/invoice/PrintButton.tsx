"use client";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors"
    >
      🖨️ Print Invoice
    </button>
  );
}
