"use client";

import { useState, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Plus, Trash2, Share2, ReceiptText, Bell, CheckCircle, Info, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import type { Bill, ReceiptData } from '@/lib/types';
import Receipt from '@/components/receipt';

export default function Home() {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState<number | ''>(0);
  const [rate, setRate] = useState<number | ''>(0);
  const [previousBills, setPreviousBills] = useState<Bill[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const receiptRef = useRef<HTMLDivElement>(null);

  const addBill = () => {
    setPreviousBills([...previousBills, { id: Date.now(), date: new Date().toISOString().split('T')[0], amount: 0 }]);
  };

  const updateBill = (id: number, field: keyof Omit<Bill, 'id'>, value: string | number) => {
    setPreviousBills(previousBills.map(bill => bill.id === id ? { ...bill, [field]: value } : bill));
  };

  const removeBill = (id: number) => {
    setPreviousBills(previousBills.filter(bill => bill.id !== id));
  };

  const { itemTotal, previousTotal, finalTotal } = useMemo(() => {
    const iTotal = (Number(weight) || 0) * (Number(rate) || 0);
    const pTotal = previousBills.reduce((acc, bill) => acc + (Number(bill.amount) || 0), 0);
    return {
      itemTotal: iTotal,
      previousTotal: pTotal,
      finalTotal: iTotal + pTotal
    };
  }, [weight, rate, previousBills]);

  const handleGenerateAndShare = async () => {
    if (!receiptRef.current) {
        toast({
            variant: "destructive",
            title: "ناکامی",
            description: "رسید کا حوالہ نہیں ملا۔",
        });
        return;
    }

    try {
        const canvas = await html2canvas(receiptRef.current, { 
          scale: 3, 
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });

        if (navigator.share) {
            await navigator.share({
                files: [file],
                title: 'پولٹری کی رسید',
                text: `تاریخ ${date} کی رسید`,
            });
        } else {
             toast({
                variant: "destructive",
                title: "شیئرنگ ممکن نہیں",
                description: "آپ کا براؤزر شیئرنگ کو سپورٹ نہیں کرتا۔",
            });
        }
    } catch (error) {
        console.error("Sharing error:", error);
        toast({
            variant: "destructive",
            title: "شیئرنگ میں خرابی",
            description: "رسید شیئر کرنے میں ناکامی ہوئی۔",
        });
    }
  };

  const receiptData: ReceiptData = {
    date,
    weight: Number(weight) || 0,
    rate: Number(rate) || 0,
    previousBills,
  };
  
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return 'Select Date';
    try {
      const d = new Date(dateStr);
      const day = ('0' + d.getDate()).slice(-2);
      const month = ('0' + (d.getMonth() + 1)).slice(-2);
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'Select Date';
    }
  };


  return (
    <div className="bg-[#333] min-h-screen">
      <header className="text-center py-3 text-white">
        <h2 className="font-semibold text-sm">Poultry Receipt Generator</h2>
      </header>
      <main className="bg-gray-50 text-black rounded-t-3xl pt-6 pb-32">
        <div className="container mx-auto max-w-sm px-4 space-y-4">
          
          <div className="relative text-center mb-6">
            <h1 className="text-2xl font-bold">افضل پولٹری شاپ</h1>
            <p className="text-sm text-gray-500">رسید</p>
            <Button variant="outline" size="icon" className="absolute top-0 right-0 rounded-xl h-12 w-12 bg-orange-100 border-orange-200 text-orange-500 hover:bg-orange-200 hover:text-orange-600">
                <Bell className="h-6 w-6" />
            </Button>
          </div>

          <Card className="shadow-md rounded-2xl border-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base font-bold">
                <span className="flex items-center gap-2">
                  <CheckCircle className="text-green-500 h-5 w-5" />
                  رقم کی تفصیلات
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="date" className="text-xs text-gray-500">تاریخ</Label>
                <div className="relative">
                   <div className="bg-gray-100 rounded-lg text-center text-base p-2.5 flex justify-between items-center">
                    <button onClick={() => setDate('')} className="text-gray-400 hover:text-gray-600">
                       <X className="h-4 w-4"/>
                    </button>
                    <span>{formatDateForInput(date)}</span>
                    <Calendar className="h-5 w-5 text-gray-400" />
                   </div>
                   <input type="date" value={date} onChange={e => setDate(e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="weight" className="text-xs text-gray-500 text-right w-full block">وزن (کلو)</Label>
                  <Input id="weight" type="number" value={weight} onChange={e => setWeight(e.target.value === '' ? '' : parseFloat(e.target.value))} step="0.01" className="bg-gray-100 border-none text-center p-2 h-auto text-base font-semibold"/>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="rate" className="text-xs text-gray-500 text-right w-full block">ریٹ / کلو</Label>
                  <Input id="rate" type="number" value={rate} onChange={e => setRate(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="bg-gray-100 border-none text-center p-2 h-auto text-base font-semibold"/>
                </div>
              </div>
               <div className="bg-orange-100 text-orange-600 rounded-lg p-3 flex justify-between items-center">
                  <span className="font-semibold text-sm">موجوده ٹوٹل</span>
                  <span className="font-bold text-lg">{itemTotal.toLocaleString()}</span>
               </div>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl border-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base font-bold">
                <span className="flex items-center gap-2">
                  <Info className="text-blue-500 h-5 w-5" />
                  سابقہ رقم
                </span>
                <Button variant="ghost" size="icon" onClick={addBill} className="text-blue-500 h-9 w-9 rounded-full bg-blue-100 hover:bg-blue-200">
                  <Plus className="h-5 w-5"/>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previousBills.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-8">
                  <p>کوئی بقایا جات نہیں</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {previousBills.map((bill) => (
                    <div key={bill.id} className="flex items-center gap-2">
                      <Input type="date" value={bill.date} onChange={e => updateBill(bill.id, 'date', e.target.value)} className="bg-gray-100 border-none w-1/3"/>
                      <Input type="number" value={bill.amount} onChange={e => updateBill(bill.id, 'amount', e.target.value === '' ? 0 : parseInt(e.target.value, 10))} className="bg-gray-100 border-none flex-grow text-right"/>
                      <Button variant="ghost" size="icon" onClick={() => removeBill(bill.id)} className="text-destructive h-8 w-8">
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className="font-semibold text-sm">توٹل سابقہ</span>
                <span className="font-bold text-lg">{previousTotal.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm rounded-t-3xl shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto max-w-sm p-3 flex justify-between items-center">
            <div>
                <p className="text-xs text-gray-500">مکمل ٹوٹل</p>
                <p className="text-2xl font-bold">{finalTotal.toLocaleString()}</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="h-12 px-6 text-base font-bold rounded-xl bg-[#212529] text-white hover:bg-gray-700 shadow-lg" disabled={!weight || !rate}>
                <ReceiptText className="ml-2 h-5 w-5"/>
                رسید بنائیں
            </Button>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm md:max-w-md p-0 bg-transparent border-0 shadow-none">
          <DialogHeader className="hidden">
            <DialogTitle>رسید کا پیش نظارہ</DialogTitle>
          </DialogHeader>
          <Receipt data={receiptData} ref={receiptRef}/>
          <DialogFooter className="px-6 pb-4 pt-0 sm:justify-center">
            <Button onClick={handleGenerateAndShare} className="w-full h-12 text-lg bg-[#212529] hover:bg-gray-700">
              <Share2 className="ml-2"/>
              شیئر کریں
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
