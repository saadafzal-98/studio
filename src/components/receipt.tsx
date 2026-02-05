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

  const displayedPreviousBills = data.previousBills.filter(bill => bill.amount && Number(bill.amount) > 0);
  const showPreviousBills = displayedPreviousBills.length > 0;

  return (
    <div 
        id="receipt-preview" 
        ref={ref} 
        className="bg-white text-gray-800 font-body w-full max-w-sm mx-auto overflow-hidden rounded-t-2xl"
        dir="rtl"
    >
      <div className="p-5 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">میاں ریسٹورنٹ</h2>
          <div className="inline-block bg-amber-100 text-amber-800 rounded-full px-4 py-1 text-sm font-semibold">
              {formatDate(data.date)}
          </div>
          <p className="text-sm text-green-600 !mt-3">وَاللَّهُ خَيْرُ الرَّازِقِينَ</p>
          <div className="flex justify-center items-center space-x-3 text-xl">
            <span>🍚</span>
            <span>🍷</span>
            <span>🍽️</span>
            <span>🍗</span>
            <span>🧋</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-md">
                <span className="text-gray-600">چکن وزن</span>
                <span className="font-semibold text-gray-900">{(Number(data.weight) || 0).toLocaleString('ur-PK')}</span>
            </div>
             <Separator className="bg-gray-200"/>
            <div className="flex justify-between items-center text-md">
                <span className="text-gray-600">ریٹ لسٹ</span>
                <span className="font-semibold text-gray-900">{(Number(data.rate) || 0).toLocaleString('ur-PK')}</span>
            </div>
             <Separator className="bg-gray-200"/>
            <div className="bg-gray-100 text-gray-800 rounded-lg p-2 flex justify-between items-center mt-2">
                <span className="font-semibold">رقم</span>
                <span className="font-bold text-lg">{Math.round(itemTotal).toLocaleString('ur-PK')}</span>
            </div>
        </div>
        
        {showPreviousBills && (
          <div className="space-y-3">
              <div className="border rounded-lg p-3 space-y-2">
                  {displayedPreviousBills.map((bill) => (
                      <div key={bill.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{formatDate(bill.date)}</span>
                        <span className="font-semibold text-gray-800">{(Number(bill.amount) || 0).toLocaleString('ur-PK')}</span>
                      </div>
                  ))}
              </div>
          </div>
        )}
      
        <div className="bg-slate-800 rounded-xl p-4 text-center text-white mt-4">
            <p className="font-bold text-md text-orange-400">ٹوٹل بل</p>
            <p className="text-4xl font-bold mt-1">{Math.round(finalTotal).toLocaleString('ur-PK')}</p>
        </div>

        <div className="text-center mt-6">
            <p className="text-gray-800 font-bold text-lg">افضل پولٹری شاپ</p>
            <p className="text-gray-500 mt-2 text-xs tracking-widest">PK</p>
            <p className="text-gray-800 font-bold text-lg mt-1">محمد على</p>
        </div>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';

export default Receipt;
