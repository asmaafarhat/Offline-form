import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private storageKey = 'offlineSubmit';

  constructor(
    private http: HttpClient
  ) { }

  async saveFormData(formData: any) {
    try {
      await localStorage.setItem(this.storageKey, JSON.stringify(formData));
    } catch (err) {
      console.error('Error while setting local storage', err);
    }
  }

  async syncWithServer() {
    let formData = (await localStorage.getItem(this.storageKey) || '{}');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    try {
        // await this.http
        //   .post('', formData, {
        //     headers,
        //   })
        //   .toPromise();
      await localStorage.setItem(this.storageKey, '');
    } catch (error) {
      console.error('Error syncing data with server:', error);
    }
  }

}
