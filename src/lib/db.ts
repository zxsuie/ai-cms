import { StudentVisit, Medicine, RefillRequest } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// In-memory store
let visits: StudentVisit[] = [
  {
    id: 'v1',
    timestamp: new Date('2023-10-26T10:00:00Z').toISOString(),
    studentName: 'Alice Johnson',
    studentId: 'S12345',
    symptoms: 'Headache and fatigue',
    reason: 'Felt unwell during class',
    aiSuggestion: 'Consider checking for dehydration or stress. A short rest might be beneficial.',
  },
  {
    id: 'v2',
    timestamp: new Date('2023-10-26T11:30:00Z').toISOString(),
    studentName: 'Bob Williams',
    studentId: 'S67890',
    symptoms: 'Scraped knee from fall',
    reason: 'Fell during recess',
    aiSuggestion: 'Clean the wound with antiseptic, apply a bandage. Monitor for signs of infection.',
  },
];

let medicines: Medicine[] = [
  { id: 'm1', name: 'Ibuprofen (200mg)', stock: 95, threshold: 20 },
  { id: 'm2', name: 'Acetaminophen (325mg)', stock: 78, threshold: 20 },
  { id: 'm3', name: 'Antiseptic Wipes', stock: 150, threshold: 50 },
  { id: 'm4', name: 'Band-Aids (Assorted)', stock: 210, threshold: 100 },
  { id: 'm5', name: 'Cold Packs', stock: 12, threshold: 10 },
  { id: 'm6', name: 'Cough Drops', stock: 45, threshold: 30 },
];

let requests: RefillRequest[] = [];

// Data access layer
export const db = {
  getVisits: async (): Promise<StudentVisit[]> => {
    return Promise.resolve(visits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  },
  
  addVisit: async (visitData: Omit<StudentVisit, 'id' | 'timestamp' | 'aiSuggestion'>, aiSuggestion: string): Promise<StudentVisit> => {
    const newVisit: StudentVisit = {
      ...visitData,
      id: `v${Date.now()}`,
      timestamp: new Date().toISOString(),
      aiSuggestion: aiSuggestion,
    };
    visits = [newVisit, ...visits];
    return Promise.resolve(newVisit);
  },

  addReleaseFormLink: async (visitId: string, link: string): Promise<boolean> => {
    const visitIndex = visits.findIndex(v => v.id === visitId);
    if (visitIndex > -1) {
      visits[visitIndex].releaseFormLink = link;
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },
  
  getMedicines: async (): Promise<Medicine[]> => {
    return Promise.resolve(medicines);
  },

  dispenseMedicine: async (medicineId: string): Promise<boolean> => {
    const medicineIndex = medicines.findIndex(m => m.id === medicineId);
    if (medicineIndex > -1 && medicines[medicineIndex].stock > 0) {
      medicines[medicineIndex].stock -= 1;
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },

  requestRefill: async (medicineId: string): Promise<boolean> => {
    const medicine = medicines.find(m => m.id === medicineId);
    if (medicine) {
      const newRequest: RefillRequest = {
        id: `r${Date.now()}`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        requestDate: new Date().toISOString(),
      };
      requests = [newRequest, ...requests];
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
};
