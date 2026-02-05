"use client";

import React, { useMemo, forwardRef } from 'react';
import type { ReceiptData } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

interface ReceiptProps {
  data: ReceiptData;
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ data }, ref) => {
  const itemTotal = useMemo(() => (Number(data.weight) || 0) * (Number(data.rate) || 0), [data.weight, data.rate]);
  const previousTotal = useMemo(() => data.previousBills.reduce((acc, bill) => acc + (Number(bill.amount) || 0), 0), [data.previousBills]);
  const finalTotal = useMemo(() => itemTotal + previousTotal, [itemTotal, previousTotal]);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return '--/--/----';
      const d = new Date(dateString);
      const day = ('0' + d.getDate()).slice(-2);
      const month = ('0' + (d.getMonth() + 1)).slice(-2);
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return '--/--/----';
    }
  };

  return (
    <div 
        id="receipt-preview" 
        ref={ref} 
        className="bg-white text-black font-body w-full max-w-sm mx-auto rounded-t-3xl overflow-hidden"
        dir="rtl"
    >
      <div className="p-5">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold">میاں ریسٹورنٹ</h2>
          <div className="inline-block bg-orange-100 text-orange-800 rounded-full px-4 py-1 my-3 text-xs font-semibold">
              {formatDate(data.date)}
          </div>
          <p className="text-green-600 text-base">وَاللَّهُ خَيْرُ الرَّازِقِينَ</p>
          <div className="mt-2 text-2xl flex justify-center items-center gap-3">
              <span>🍗</span><span>🍷</span><span>🍽️</span><span>🐔</span><span>🥣</span>
          </div>
        </div>

        <div className="space-y-4 text-sm">
            <div className="bg-gray-100 rounded-xl p-3 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">چکن وزن</span>
                    <span className="font-bold text-base">{(Number(data.weight) || 0).toLocaleString('ur-PK')}</span>
                </div>
                 <Separator className="bg-gray-200 my-2"/>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">ریٹ لسٹ</span>
                    <span className="font-bold text-base">{(Number(data.rate) || 0).toLocaleString('ur-PK')}</span>
                </div>
                <div className="bg-orange-500 text-white rounded-lg p-2 flex justify-between items-center mt-3">
                    <span className="font-semibold text-xs">(ٹوٹل)</span>
                    <span className="font-bold text-base">{itemTotal.toLocaleString('ur-PK')}</span>
                </div>
            </div>

            <div>
                <p className="text-right mb-1 text-xs text-gray-500">سابقہ رقم</p>
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                    {previousTotal > 0 ? (
                        <span className="font-bold text-xl">{previousTotal.toLocaleString('ur-PK')}</span>
                    ) : (
                        <p className="text-gray-400 text-xs">No previous balance</p>
                    )}
                </div>
            </div>
        </div>
      </div>
      
      <div className="bg-[#0d1a2a] text-white p-5">
        <div className="bg-[#1f2d3d] rounded-2xl p-4 text-center">
            <p className="text-orange-400 font-bold text-sm">ٹوٹل بل</p>
            <p className="text-4xl font-bold mt-1">{finalTotal.toLocaleString('ur-PK')}</p>
        </div>

        <div className="text-center mt-6">
            <p className="text-green-400 font-bold text-lg">افضل پولٹری شاپ</p>
            <p className="text-gray-500 mt-2 text-xs">PK</p>
            <p className="text-2xl font-bold">محمد على</p>
        </div>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';

export default Receipt;
