import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Video } from '../../models/video';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent {

  @Input() video!: Video;
  @Output() edit = new EventEmitter<Video>()
  @Output() delete = new EventEmitter<Video>()

  userRole!: string | null;
  
  constructor(){
    const userRole = localStorage.getItem('role');
    let parseUserRole = null;
    if(userRole != null){
      parseUserRole = JSON.parse(userRole)
    }
   
    this.userRole = parseUserRole
  }

  get embedLink(): string {
    const videoId = this.video.videoLink.split('v=')[1];
    return `https://www.youtube.com/embed/${videoId.split('&')[0]}`; 
  }

  onDelete(){
    this.delete.emit(this.video)
  }

  onEdit(){
    this.edit.emit(this.video)
  }
}
