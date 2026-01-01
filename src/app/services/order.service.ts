import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateOrderRequest {
  productId: string;
  prompt?: string;
  file?: File;
  size?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly baseUrl = `${environment.apiUrl}/api/orders/create-order`;
  private readonly ordersBase = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  create(payload: CreateOrderRequest): Observable<any> {
    const form = new FormData();
    form.append('productId', payload.productId);
    if (payload.prompt) form.append('prompt', payload.prompt);
    if (payload.file) form.append('file', payload.file);
    if (payload.size) form.append('size', payload.size);
    return this.http.post(this.baseUrl, form);
  }

  getDesignsByOrder(orderId: string): Observable<
    { id: string; source: string; prompt?: string; imageUrl: string; elements: any; orderId?: string }[]
  > {
    return this.http.get<
      { id: string; source: string; prompt?: string; imageUrl: string; elements: any; orderId?: string }[]
    >(`${this.ordersBase}/${orderId}/designs`);
  }

  confirm(
    orderId: string,
    payload: {
      phoneNumber?: string;
      size?: string;
      color?: string;
      frontSnapshot?: File;
      backSnapshot?: File;
      designFiles?: File[];
      textFiles?: File[];
    },
  ): Observable<any> {
    const form = new FormData();
    if (payload.phoneNumber) form.append('phoneNumber', payload.phoneNumber);
    if (payload.size) form.append('size', payload.size);
    if (payload.color) form.append('color', payload.color);
    if (payload.frontSnapshot) form.append('frontSnapshot', payload.frontSnapshot);
    if (payload.backSnapshot) form.append('backSnapshot', payload.backSnapshot);
    (payload.designFiles || []).forEach((f) => form.append('designFiles', f));
    (payload.textFiles || []).forEach((f) => form.append('textFiles', f));
    return this.http.post(`${this.ordersBase}/${orderId}/confirm`, form);
  }
}
