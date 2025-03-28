import { Component, OnInit } from '@angular/core';
import { VideoService } from '../../services/video.service';
import { Video } from '../../models/video';
import { MatDialog } from '@angular/material/dialog';
import { VideoDialogComponent } from './video-dialog/video-dialog.component';
import { ConfirmDeleteComponent } from 'src/app/shared/shared/confirm-delete/confirm-delete.component';

@Component({
  selector: 'app-content-video',
  templateUrl: './content-video.component.html',
  styleUrls: ['./content-video.component.scss']
})
export class ContentVideoComponent implements OnInit{

  videos: any;
  userRole: string | null

  constructor(private videoService: VideoService,
    private dialog: MatDialog
  ){
    const userRole = localStorage.getItem('role');
    let parseUserRole = null;
    if(userRole != null){
      parseUserRole = JSON.parse(userRole)
    }
   
    this.userRole = parseUserRole
  }

  ngOnInit(): void {
    this.loadVideos()
  }

  loadVideos(){
    this.videoService.allVideoes().subscribe(response=>{
      this.videos = response;
    })
  }

  openDialog(){
    const dialogRef = this.dialog.open(VideoDialogComponent,{
      width: '350px'
    });
    dialogRef.afterClosed().subscribe(res=>{
      if(res){
        this.videos = res;
      }
      this.loadVideos()
    })
  }

  confirmVideoDelete(id:number){
    const dialogRef = this.dialog.open(ConfirmDeleteComponent,{
      width: '280px',
      height: '175px',
      data: {
        id: id,
        message: "Ushbu videoni o'chirishga ishonchingiz komilmi?"
      }
    });
    dialogRef.afterClosed().subscribe(res=>{
      if(res){
        this.deletevideo(id)
      }
    })
  }

  deletevideo(id:number){
    this.videoService.deleteVideo(id).subscribe(()=>{
      this.loadVideos();
    })
  }

}
