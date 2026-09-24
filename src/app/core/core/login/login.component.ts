import { jwtDecode } from 'jwt-decode';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { TokenPayload } from '../models/jwtTokenPayload';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
  hide: boolean = true;
  isSignUp: boolean = false;
  
  ngOnInit(): void {
    this.formBuilder()
    
  }
  loginForm!: FormGroup;

  constructor(private loginService: UserService,
    private router: Router
  ){}

  signUpClose(event: boolean){
    this.isSignUp = event
  }

  formBuilder(){
    this.loginForm = new FormGroup({
      phone: new FormControl<string>('', [Validators.required,
      ]),
      password: new FormControl<string>('', Validators.required)
    });
  }

  login(){
    if(this.loginForm.valid){
      this.loginForm.controls
     const formValue = this.loginForm.value
     console.log(formValue);
     this.loginService.login(formValue).subscribe({
      next: (res: any) => {

        const decoded = <TokenPayload>jwtDecode(res.data.token);
        localStorage.setItem('userId', JSON.stringify(decoded.Id));
        localStorage.setItem('role', JSON.stringify(decoded.role)),
        this.router.navigate(['/home']);
      }, 
     })
    }
  }

}
