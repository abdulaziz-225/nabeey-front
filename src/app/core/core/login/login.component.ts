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
  //  currentDate = new Date(); 
  //  myuYutgani = new Date(2022, 8, 4);
  //  lfcYutgani = new Date(2022, 2, 17);
  //  sitiYutgani = new Date(2023, 3, 27);
  //  chelsiYutgani = new Date(2021, 7, 22);
  //  totYutgani = new Date(2022, 4, 12);

  //   calculateDaysBetween(date: Date): number {
  //   const differenceInTime = this.currentDate.getTime() - date.getTime();
  //   return Math.floor(differenceInTime / (1000 * 60 * 60 * 24));
  // }
  
  ngOnInit(): void {
    // console.log(`MYU APLda Arsenalni yutganiga ${this.calculateDaysBetween(this.myuYutgani)} kun bolgan.`);
    // console.log(`Liverpul APLda Arsenalni yutganiga ${this.calculateDaysBetween(this.lfcYutgani)} kun bolgan.`);
    // console.log(`Manchester Siti APLda Arsenalni yutganiga ${this.calculateDaysBetween(this.sitiYutgani)} kun bolgan.`);
    // console.log(`Chelsi APLda Arsenalni yutganiga ${this.calculateDaysBetween(this.chelsiYutgani)} kun bolgan.`);
    // console.log(`Tottenham APLda Arsenalni yutganiga ${this.calculateDaysBetween(this.totYutgani)} kun bolgan.`);
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
