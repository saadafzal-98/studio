"use client";

import { useState, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Plus, Trash2, Share2, ReceiptText, Bell, CheckCircle, Info, Calendar, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import type { Bill, ReceiptData } from '@/lib/types';
import Receipt from '@/components/receipt';

export default function Home() {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState<number | ''>('');
  const [rate, setRate] = useState<number | ''>('');
  const [previousBills, setPreviousBills] = useState<Bill[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const receiptRef = useRef<HTMLDivElement>(null);

  const addBill = () => {
    setPreviousBills([...previousBills, { id: Date.now(), date: new Date().toISOString().split('T')[0], amount: '' }]);
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
            backgroundColor: '#FFFFFF'
        });
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

        if (Capacitor.isNativePlatform()) {
            // Native platform: save file and share URI
            const base64Data = dataUrl.split(',')[1];
            
            const result = await Filesystem.writeFile({
                path: `receipt-${Date.now()}.jpeg`,
                data: base64Data,
                directory: Directory.Cache,
            });

            await Share.share({
                title: 'پولٹری کی رسید',
                url: result.uri,
                dialogTitle: 'رسید شیئر کریں',
            });
        } else if (navigator.share) {
            // Web platform: use Web Share API with blob
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
            await navigator.share({
                files: [file],
                title: 'پولٹری کی رسید',
                text: `تاریخ ${date} کی رسید`,
            });
        } else {
            toast({
                variant: "destructive",
                title: "شیئرنگ ممکن نہیں",
                description: "آپ کا براؤزر یا ڈیوائس شیئرنگ کو سپورٹ نہیں کرتا۔",
            });
        }
    } catch (error: any) {
        if (error.name === 'AbortError' || (error.message && error.message.includes('canceled'))) {
            console.log("Sharing cancelled by user.");
            return;
        }
        console.error("Sharing error:", error);
        toast({
            variant: "destructive",
            title: "شیئرنگ میں خرابی",
            description: error.message || "رسید شیئر کرنے میں ناکامی ہوئی۔",
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
                  <Input dir="ltr" id="weight" type="number" value={weight} onChange={e => setWeight(e.target.value === '' ? '' : parseFloat(e.target.value))} step="0.01" className="bg-gray-100 border-none text-center p-2 h-auto text-base font-semibold"/>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="rate" className="text-xs text-gray-500 text-right w-full block">ریٹ / کلو</Label>
                  <Input dir="ltr" id="rate" type="number" value={rate} onChange={e => setRate(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="bg-gray-100 border-none text-center p-2 h-auto text-base font-semibold"/>
                </div>
              </div>
               {itemTotal > 0 && (
                 <div className="bg-orange-100 text-orange-700 rounded-lg p-3 flex justify-between items-center">
                    <span className="font-semibold text-sm">رقم</span>
                    <span className="font-bold text-lg">{itemTotal.toLocaleString()}</span>
                 </div>
               )}
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
                      <Input dir="ltr" type="number" value={bill.amount} onChange={e => updateBill(bill.id, 'amount', e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="bg-gray-100 border-none flex-grow text-center"/>
                      <Button variant="ghost" size="icon" onClick={() => removeBill(bill.id)} className="text-destructive h-8 w-8">
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              { previousTotal > 0 && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <span className="font-semibold text-sm">توٹل سابقہ</span>
                  <span className="font-bold text-lg">{previousTotal.toLocaleString()}</span>
                </div>
              )}
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
          <DialogTitle className="sr-only">Receipt Preview</DialogTitle>
          <DialogDescription className="sr-only">
            A preview of the generated receipt. You can share it via WhatsApp or go back to edit the details.
          </DialogDescription>
          
          <div className="bg-white rounded-t-2xl flex flex-col">
            <div className="p-4 flex flex-row-reverse justify-between items-center border-b">
               <Button onClick={handleGenerateAndShare} className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full h-10 px-5 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  <span>واٹس ایپ</span>
                </Button>
                <Button onClick={() => setIsDialogOpen(false)} variant="ghost" className="text-gray-500 hover:bg-gray-100 rounded-full h-10 w-10 p-2">
                    <ChevronLeft className="h-6 w-6" />
                    <span className="sr-only">ترمیم</span>
                </Button>
            </div>
            
            <div className="overflow-y-auto max-h-[75vh]">
              <Receipt data={receiptData} ref={receiptRef}/>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
