import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'src/app/core/core/services/user.service';

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss']
})
export class ProfileDialogComponent {
  profileForm!: FormGroup;
  imagePreview!: string;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<ProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    
  ) {
    console.log(data.profile);
    
  }

  ngOnInit(): void {
    this.imagePreview = this.data.profile.asset?.filePath || 'assets/Default_pfp.svg.png';

    this.profileForm = this.fb.group({
      id: [this.data.profile.id],
      firstName: [this.data.profile.firstName, Validators.required],
      lastName: [this.data.profile.lastName, Validators.required],
      email: [this.data.profile.email, [Validators.required, Validators.email]],
      phone: [this.data.profile.phone, Validators.required],
      image: [''],
    });
  }

  onSave(): void {
    if (this.profileForm.valid) {
      const updatedProfile =this.profileForm.value
        this.userService.updateUser(updatedProfile).subscribe({
          next: ()=>{
            this.dialogRef.close(); 
          }
        })
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = () => {
      this.imagePreview = reader.result as string; 
      this.profileForm.patchValue({ image: file }); 
    };
  
    if (file) {
      reader.readAsDataURL(file);
    }
  }
  


  }

