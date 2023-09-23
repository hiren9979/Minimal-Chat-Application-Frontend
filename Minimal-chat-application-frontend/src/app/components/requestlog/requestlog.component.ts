// requestlog.component.ts

import { Component } from '@angular/core';
import { LogService } from 'src/app/service/log.service';
import { OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-requestlog',
  templateUrl: './requestlog.component.html',
  styleUrls: ['./requestlog.component.css']
})
export class RequestlogComponent implements OnInit {

  logs: any[] = [];
  startTime: Date | null = null;
  endTime: Date | null = null;
  selectedTimeRange: string = '5'; // Default time range
  showId: boolean = true;
  showIpAddress: boolean = true;
  showTimestamp: boolean = true;
  showUsername: boolean = true;
  showRequestBody: boolean = true;

  constructor(
    private logService: LogService,
    private authService: AuthService,
    private http: HttpClient,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    // Initialize the component with logs (you can set default time range here)
    this.fetchLogs();
  }

  // Add the handleTimeRangeClick function
handleTimeRangeClick(minutes: number): void {
  // Calculate the start time and end time based on the selected time range
  const currentTime = new Date();
  const startTime = new Date(currentTime.getTime() - minutes * 60000);
  this.startTime = startTime;
  this.endTime = currentTime;

  // Set the selectedTimeRange to 'custom' to show the custom time range picker
  this.selectedTimeRange = 'custom';

  // Call fetchLogs to fetch logs for the selected time range
  this.fetchLogs();
}


  fetchLogs(): void {
    // Get the JWT token from AuthService
    const token = this.authService.getToken();

    if (token) {
      // Create headers with the Authorization header containing the JWT token
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      let startTimeToSend: Date | undefined = undefined;
      let endTimeToSend: Date | undefined = undefined;

      if (this.selectedTimeRange === 'custom') {
        startTimeToSend = this.startTime !== null ? this.startTime : undefined;
        endTimeToSend = this.endTime !== null ? this.endTime : undefined;
      } else {
        // Calculate the start and end time based on the selected time range
        const currentTime = new Date();
        startTimeToSend = new Date(currentTime.getTime() - parseInt(this.selectedTimeRange) * 60000);
        endTimeToSend = currentTime;
      }

      this.logService.getLogs(headers, startTimeToSend, endTimeToSend).subscribe(
        (logs) => {
          this.logs = logs;
          console.log(logs);
          this.toastr.success('Log fetch successfully', 'success');
        },
        (error) => {
          this.toastr.error('Error in fetch log', 'error');
          console.error('Error fetching logs:', error);
        }
      );
    }
  }
}
