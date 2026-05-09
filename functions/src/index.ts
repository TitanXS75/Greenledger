import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, getDocs, query, collection, where, setDoc, doc } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

initializeApp();

export const generateSummary = onCall(async (request) => {
  const { date } = request.data;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new HttpsError('invalid-argument', 'Valid date (YYYY-MM-DD) required');
  }

  const db = getFirestore();
  const snap = await getDocs(query(
    collection(db, 'expenses'),
    where('date', '==', date),
    where('isDeleted', '!=', true)
  ));

  const totals: Record<string, number> = {};
  let grandTotal = 0;
  snap.forEach(d => {
    const e = d.data();
    totals[e.category] = (totals[e.category] || 0) + e.amount;
    grandTotal += e.amount;
  });

  const summary = { 
    date, 
    totalsByCategory: totals, 
    grandTotal, 
    generatedAt: new Date().toISOString() 
  };
  await setDoc(doc(db, 'daily-summaries', date), summary);
  return summary;
});

export const dailyAutoSummary = onSchedule(
  { schedule: '0 0 * * *', timeoutSeconds: 300, memory: '512MiB' },
  async (event) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().slice(0, 10);
    
    // Logic is same as above but run internally
    const db = getFirestore();
    const snap = await getDocs(query(
      collection(db, 'expenses'),
      where('date', '==', dateStr),
      where('isDeleted', '!=', true)
    ));

    const totals: Record<string, number> = {};
    let grandTotal = 0;
    snap.forEach(d => {
      const e = d.data();
      totals[e.category] = (totals[e.category] || 0) + e.amount;
      grandTotal += e.amount;
    });

    const summary = { 
      date: dateStr, 
      totalsByCategory: totals, 
      grandTotal, 
      generatedAt: new Date().toISOString() 
    };
    await setDoc(doc(db, 'daily-summaries', dateStr), summary);
  }
);
