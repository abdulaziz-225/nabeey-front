import { Video } from './../../../models/video';
import { DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContentCategoryService } from 'src/app/content-category/services/content-category.service';
import { VideoService } from 'src/app/content-category/services/video.service';

@Component({
  selector: 'app-video-dialog',
  templateUrl: './video-dialog.component.html',
  styleUrls: ['./video-dialog.component.scss']
})
export class VideoDialogComponent implements OnInit {

  videoForm!: FormGroup;
  contentCategories: any;
  videoUrl: string = '';
  isEdit: boolean;
  video: any

  constructor(private videoService: VideoService,
    private categoryService: ContentCategoryService, 
    public dialogRef: DialogRef<VideoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data:any,  
    private fb: FormBuilder
  ){
    this.isEdit = data.isEdit;
    this.video = data.video
    console.log(data.video);
    
  }

  ngOnInit(): void {
    this.formBuilder();
    this.categories();

    if(this.isEdit && this.video?.id){
      this.videoForm.patchValue(this.video)
    }

  }

  categories(){
    this.categoryService.loadContentCategory().subscribe(data=>{
      this.contentCategories = data
    })
  }

  formBuilder(){
    this.videoForm = this.fb.group({
      id: [this.video?.id],
      title: ['', Validators.required],
      description: ['', Validators.required],
      videoLink: ['', Validators.required],
      categoryId: ['', Validators.required],
    })
  }

  onClose(){
    this.dialogRef.close()
  }

  createVideo(){
    if(this.videoForm.valid){
    const valueForm =   this.videoForm.value;
    valueForm.videoLink = this.formatVideoUrl(valueForm.videoLink);
    this.videoService.createVideo(valueForm).subscribe({
      next: ()=>{
        this.dialogRef.close()
      }
    })
    }
  }

  formatVideoUrl(videoLink: string): string {
    if (videoLink.includes('youtu.be')) {
      const videoId = videoLink.split('youtu.be/')[1];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return videoLink;
  }
  
}
