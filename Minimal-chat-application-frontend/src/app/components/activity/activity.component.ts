import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { GroupService } from 'src/app/service/group.service';
import { RealTimeMessageService } from 'src/app/service/real-time-message.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css'],
})
export class ActivityComponent {
  taggedMessages: any[] = [];
  isopenMessageInfo : boolean = false;
  selectedMessage : any ;

  constructor(
    private groupService: GroupService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.fetchTaggedMessages();
  }

  fetchTaggedMessages() {
    this.groupService.fetchTaggedMessages().subscribe(
      (response) => {
        console.log(response);
        this.taggedMessages = response.messages;

        let i;
        for (i = 0; i < this.taggedMessages.length; i++) {
          if (this.taggedMessages[i].content.startsWith('[[]]')) {
            // Remove the first 4 characters from content
            this.taggedMessages[i].content =
              this.taggedMessages[i].content.slice(4);
          }

          // Parse the timestamp as a Date object
          const timestamp = new Date(this.taggedMessages[i].timestamp);

          // Format the timestamp as "dd-mm-yyyy : HH:MM:SS" (you can adjust the format as needed)
          const formattedTimestamp = `${padZero(timestamp.getDate())}-${padZero(
            timestamp.getMonth() + 1
          )}-${timestamp.getFullYear()} : ${padZero(
            timestamp.getHours()
          )}:${padZero(timestamp.getMinutes())}:${padZero(
            timestamp.getSeconds()
          )}`;

          this.taggedMessages[i].timestamp = formattedTimestamp;
        }

        function padZero(num: any) {
          return num.toString().padStart(2, '0');
        }

        this.toastr.success(
          'Successfully fetched message where user is tagged',
          'Success'
        );
        console.log('All Tagged Message : ', this.taggedMessages);
      },
      (error) => {
        this.toastr.error(
          'Error while fetching message where user is tagged',
          'Error'
        );
        console.error('Error fetching tagged messages:', error);
      }
    );
  }


  openMessageInfo(message : any)
  {
    this.selectedMessage = message;
    this.isopenMessageInfo = true;
    console.log("here",this.isopenMessageInfo,this.selectedMessage);
    
  }

  closeMessageInfo()
  {
    this.isopenMessageInfo = false;
  }

}
