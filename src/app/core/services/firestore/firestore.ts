import { Injectable, inject } from '@angular/core';
import { Firestore as NgFirestore, collection, collectionData, doc, docData, setDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore: NgFirestore = inject(NgFirestore);

  constructor() {}

  getCollection<T>(path: string, ...queryFn: any[]): Observable<T[]> {
    const colRef = collection(this.firestore, path);
    const q = query(colRef, ...queryFn);
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }

  getDoc<T>(path: string): Observable<T> {
    const docRef = doc(this.firestore, path);
    return docData(docRef, { idField: 'id' }) as Observable<T>;
  }

  createDoc(path: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, path);
    return setDoc(docRef, data);
  }

  updateDoc(path: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, path);
    return updateDoc(docRef, data);
  }

  deleteDoc(path: string): Promise<void> {
    const docRef = doc(this.firestore, path);
    return deleteDoc(docRef);
  }
}
