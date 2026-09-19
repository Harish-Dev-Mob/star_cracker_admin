import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import PrintButton from "./PrintButton";

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(n);
}

export default async function InvoicePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) return notFound();

  // Fetch site config for license/GSTIN
  const configs = await prisma.siteConfig.findMany({
    where: { key: { in: ["licenseNumber", "pesoCceDetails"] } }
  });
  const configMap = configs.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:py-0 print:bg-white">
      <div className="max-w-4xl mx-auto bg-white shadow-lg p-10 print:shadow-none print:p-0">

        {/* Print Button (hidden when printing) */}
        <div className="flex justify-end mb-8 print:hidden">
          <PrintButton />
        </div>

        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">INVOICE</h1>
            <p className="text-gray-500 font-mono text-sm">#{order.id}</p>
            <p className="text-gray-500 font-medium text-sm mt-1">
              Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-red-600 mb-1">FireCracker Store</h2>
            <p className="text-sm text-gray-600">123 Market Street, Sivakasi</p>
            <p className="text-sm text-gray-600">Tamil Nadu, 626123</p>
            <p className="text-sm text-gray-600 mt-2 font-bold">GSTIN: 33AXXXX0000X1Z5</p>
            {configMap.licenseNumber && <p className="text-xs text-gray-500 mt-1">License: {configMap.licenseNumber}</p>}
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
            <p className="font-bold text-gray-900 text-lg">{order.user.name}</p>
            <p className="text-gray-600">{order.user.email || '—'}</p>
            <p className="text-gray-600">{order.user.phone || '—'}</p>
          </div>
          {order.address && (
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Shipped To</h3>
              <p className="font-bold text-gray-900 text-lg">{order.address.name}</p>
              <p className="text-gray-600">{order.address.street}</p>
              <p className="text-gray-600">{order.address.city}, {order.address.state} {order.address.pincode}</p>
              <p className="text-gray-600">Phone: {order.address.phone}</p>
            </div>
          )}
        </div>

        {/* Items Table */}
        <table className="w-full text-left mb-8">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">HSN</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Qty</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Base Rate</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">GST %</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Tax Amt</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.orderItems.map((item) => {
              const gstRate = item.product.gstRate || 18;
              const inclusivePrice = item.priceAtOrder;
              const basePrice = inclusivePrice / (1 + (gstRate / 100));
              const taxAmount = inclusivePrice - basePrice;

              return (
                <tr key={item.id}>
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{item.product.crackerType}</p>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{item.product.hsnCode || '—'}</td>
                  <td className="py-4 px-4 text-right font-medium">{item.quantity}</td>
                  <td className="py-4 px-4 text-right font-medium">{formatPrice(basePrice)}</td>
                  <td className="py-4 px-4 text-right font-medium text-gray-500">{gstRate}%</td>
                  <td className="py-4 px-4 text-right font-medium text-gray-500">{formatPrice(taxAmount * item.quantity)}</td>
                  <td className="py-4 px-4 text-right font-bold text-gray-900">
                    {formatPrice(inclusivePrice * item.quantity)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end border-t-2 border-gray-200 pt-8">
          <div className="w-80 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Total Taxable Value</span>
              <span className="font-medium">
                {formatPrice(order.orderItems.reduce((acc, item) => {
                  const basePrice = item.priceAtOrder / (1 + ((item.product.gstRate || 18) / 100));
                  return acc + (basePrice * item.quantity);
                }, 0))}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Total Tax Amount</span>
              <span className="font-medium">
                {formatPrice(order.orderItems.reduce((acc, item) => {
                  const basePrice = item.priceAtOrder / (1 + ((item.product.gstRate || 18) / 100));
                  const taxAmount = item.priceAtOrder - basePrice;
                  return acc + (taxAmount * item.quantity);
                }, 0))}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 font-bold pt-2 border-t border-gray-100">
              <span>Subtotal (Incl. Tax)</span>
              <span className="font-bold text-gray-900">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                <span className="font-medium">−{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600 pb-3 border-b border-gray-200">
              <span>Delivery Fee</span>
              <span className="font-medium">{formatPrice(order.total - order.subtotal + order.discount)}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-gray-900 pt-1">
              <span>Total Amount</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-sm text-gray-500">
          <p className="font-bold text-gray-900 mb-1">Terms & Conditions</p>
          <p>1. All disputes are subject to Sivakasi jurisdiction.</p>
          <p>2. Goods once sold cannot be returned unless damaged during transit.</p>
          <p>3. Ensure proper safety measures while bursting crackers.</p>
          <p className="mt-4 text-xs italic">This is a computer-generated document and does not require physical signature.</p>
        </div>

      </div>
    </div>
  );
}
