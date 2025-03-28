import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { FormatePhonePipe } from 'src/app/shared/shared/pipes/formate-phone.pipe';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit{

  @Output() public signUpClose = new EventEmitter<boolean>();

  hide = true
  signUpForm!: FormGroup

  constructor(private userService: UserService, 
              private formBuilder: FormBuilder
  ){}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.signUpForm = this.formBuilder.group({
      FirstName: ['', [Validators.required, Validators.minLength(2),
        Validators.pattern('^[a-zA-Z]+$')
      ]],
      LastName: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Phone: ['', Validators.required],
      Password: ['', Validators.required],
      Image: [null]  
    });
  }

  signUp(){
    if(this.signUpForm.valid){
      const formValue = this.signUpForm.value
      this.userService.signUp(formValue).subscribe({
        complete: ()=>{
          this.signUpClose.emit(false)
        }
      })
    }
  }
  
}