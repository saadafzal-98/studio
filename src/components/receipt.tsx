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

  return (
    <div 
        id="receipt-preview" 
        ref={ref} 
        className="bg-[#0d1a2a] text-gray-200 font-body w-full max-w-sm mx-auto rounded-t-3xl overflow-hidden"
        dir="rtl"
    >
      <div className="p-6 space-y-6">
        <div className="text-center">
          <p className="text-sm text-green-400">وَاللَّهُ خَيْرُ الرَّازِقِينَ</p>
          <h2 className="text-4xl font-bold text-white mt-1">افضل پولٹری شاپ</h2>
          <div className="inline-block border border-orange-400/50 text-orange-400 rounded-full px-4 py-1 mt-3 text-sm font-semibold">
              {formatDate(data.date)}
          </div>
        </div>

        <div className="bg-[#1f2d3d]/70 rounded-2xl p-4 space-y-4">
            <div className="flex justify-between items-baseline">
                <span className="text-gray-400">چکن وزن (کلو)</span>
                <span className="font-bold text-xl text-white">{(Number(data.weight) || 0).toLocaleString('ur-PK')}</span>
            </div>
             <Separator className="bg-gray-700"/>
            <div className="flex justify-between items-baseline">
                <span className="text-gray-400">ریٹ لسٹ</span>
                <span className="font-bold text-xl text-white">{(Number(data.rate) || 0).toLocaleString('ur-PK')}</span>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 text-white rounded-lg p-3 flex justify-between items-center mt-3">
                <span className="font-semibold text-orange-400">موجوده ٹوٹل</span>
                <span className="font-bold text-2xl">Rs {itemTotal.toLocaleString('ur-PK')}</span>
            </div>
        </div>

        {displayedPreviousBills.length > 0 && (
          <div className="space-y-3">
              <p className="text-right text-base font-bold text-gray-300">سابقہ رقم</p>
              <div className="bg-[#1f2d3d]/70 rounded-2xl p-4 space-y-3">
                  {displayedPreviousBills.map((bill) => (
                      <div key={bill.id} className="flex justify-between items-center text-base">
                      <span className="text-gray-500 text-sm">{formatDate(bill.date)}</span>
                      <span className="font-semibold text-gray-300">{(Number(bill.amount) || 0).toLocaleString('ur-PK')}</span>
                      </div>
                  ))}
                  {displayedPreviousBills.length > 1 && (
                      <>
                          <Separator className="my-2 bg-gray-700" />
                          <div className="flex justify-between items-center font-bold text-lg text-white">
                              <span>سابقہ ٹوٹل</span>
                              <span>{previousTotal.toLocaleString('ur-PK')}</span>
                          </div>
                      </>
                  )}
              </div>
          </div>
        )}
      </div>
      
      <div className="bg-[#070e17] px-6 py-8">
        <div className="bg-[#1f2d3d] rounded-2xl p-5 text-center">
            <p className="text-orange-400 font-bold text-lg">ٹوٹل بل</p>
            <p className="text-5xl font-bold mt-2 text-white">{finalTotal.toLocaleString('ur-PK')}</p>
        </div>

        <div className="text-center mt-8">
            <p className="text-green-400 font-bold text-xl">محمد على</p>
            <p className="text-gray-500 mt-2 text-sm tracking-widest">PK</p>
        </div>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';

export default Receipt;
