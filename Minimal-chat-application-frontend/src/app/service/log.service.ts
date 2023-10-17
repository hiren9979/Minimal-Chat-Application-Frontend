import { Injectable } from '@angular/core';
import { HttpClient , HttpParams , HttpHeaders } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = 'https://localhost:7288/api/Log';

  constructor(
    private http: HttpClient,
    ) { }

    formatDateToCustomFormat(date: Date): string {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      const milliseconds = date.getMilliseconds().toString().padStart(7, '0');
    
      const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
    
      return formattedDate;
    }


    getLogs(headers: HttpHeaders, startTime?: Date | null, endTime?: Date | null): Observable<any> {
      // Create new variables for startTime and endTime
      let validStartTime: string | null = null;
      let validEndTime: string | null = null;
    
      let params = new HttpParams();
    
      // Check if startTime is provided and not empty
      if (startTime) {
        // Parse the startTime string to a Date object
        const startTimeDate = new Date(startTime);
    
        // Check if the parsed date is valid
        if (!isNaN(startTimeDate.getTime())) {
          validStartTime = this.formatDateToCustomFormat(startTimeDate);
          params = params.set('startTime', validStartTime);
        } else {
          return throwError({ error: "Invalid startTime format" });
        }
      }
    
      // Check if endTime is provided and not empty
      if (endTime) {
        // Parse the endTime string to a Date object
        const endTimeDate = new Date(endTime);
    
        if (!isNaN(endTimeDate.getTime())) {
          validEndTime = this.formatDateToCustomFormat(endTimeDate);
          params = params.set('endTime', validEndTime);
        } else {
          // Handle invalid date format here
          return throwError({ error: "Invalid endTime format" });
        }
      }
    
      const options = { headers, params };
    
      return this.http.get(`${this.apiUrl}/GetLog`, options);
    }
}
