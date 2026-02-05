"use client";

import { useState, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { PlusCircle, Trash2, Share2, Calculator, ReceiptText, FilePlus, IndianRupee } from 'lucide-react';
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
  const [weight, setWeight] = useState<number | ''>('');
  const [rate, setRate] = useState<number | ''>('');
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

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      <div className="container mx-auto max-w-2xl p-4 space-y-6">
        <header className="text-center my-4">
          <h1 className="text-4xl font-bold font-headline text-primary">پولٹری رسید جنریٹر</h1>
          <p className="text-muted-foreground">آسانی سے رسیدیں بنائیں اور شیئر کریں</p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ReceiptText className="text-primary"/>مرغی کی تفصیلات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">تاریخ</Label>
              <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-card"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">وزن (کلوگرام)</Label>
                <Input id="weight" type="number" placeholder="مثال: 1.5" value={weight} onChange={e => setWeight(e.target.value === '' ? '' : parseFloat(e.target.value))} step="0.01" className="bg-card"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">ریٹ (فی کلو)</Label>
                <Input id="rate" type="number" placeholder="مثال: 650" value={rate} onChange={e => setRate(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="bg-card"/>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FilePlus className="text-primary"/>پچھلا بقایاجات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {previousBills.map((bill) => (
              <div key={bill.id} className="flex items-center gap-2 p-2 border rounded-lg">
                <Input type="date" value={bill.date} onChange={e => updateBill(bill.id, 'date', e.target.value)} className="bg-card w-1/3"/>
                <div className="relative w-2/3">
                  <IndianRupee className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="number" placeholder="رقم" value={bill.amount} onChange={e => updateBill(bill.id, 'amount', e.target.value === '' ? 0 : parseInt(e.target.value, 10))} className="bg-card pr-8 text-right"/>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeBill(bill.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-5 w-5"/>
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addBill} className="w-full">
              <PlusCircle className="ml-2 h-4 w-4"/>
              نیا بل شامل کریں
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calculator className="text-primary"/>کل حساب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-lg">
            <div className="flex justify-between"><span>آئٹم کا ٹوٹل:</span> <span className="font-bold">{itemTotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>پچھلا ٹوٹل:</span> <span className="font-bold">{previousTotal.toLocaleString()}</span></div>
            <hr className="my-2"/>
            <div className="flex justify-between text-2xl text-primary"><strong>حتمی کل:</strong> <strong className="font-headline">{finalTotal.toLocaleString()}</strong></div>
          </CardContent>
        </Card>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
        <Button onClick={() => setIsDialogOpen(true)} className="w-full h-14 text-xl font-bold" disabled={!weight || !rate}>
          <ReceiptText className="ml-2 h-6 w-6"/>
          رسید دیکھیں
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm md:max-w-md p-0 bg-transparent border-0 shadow-none">
          <DialogHeader className="hidden">
            <DialogTitle>رسید کا پیش نظارہ</DialogTitle>
          </DialogHeader>
          <Receipt data={receiptData} ref={receiptRef}/>
          <DialogFooter className="px-6 pb-4 pt-0 sm:justify-center">
            <Button onClick={handleGenerateAndShare} className="w-full h-12 text-lg">
              <Share2 className="ml-2"/>
              شیئر کریں
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
