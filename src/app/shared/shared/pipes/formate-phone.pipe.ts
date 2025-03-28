import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatePhone'
})
export class FormatePhonePipe implements PipeTransform {

  transform(value: string): string   {
  if(!value) return '';

  // let cleaned = value.replace(/^\+998\s?/, '').replace(/\D/g, '')
     let cleaned = value.replace(/^\+998\s?/, '').replace(/\D/g, '');


  let countryCode = '+998';
  let formatted = countryCode

  if(cleaned.length>2){
    formatted += ` (${cleaned.slice(0,2)})`
    if(cleaned.length>5){
      formatted += ` ${cleaned.slice(2,5)}-${cleaned.slice(5,7)}`;
      if(cleaned.length>7){
        formatted += `-${cleaned.slice(7,9)}`;
      }
    }
    else{
      formatted += ` ${cleaned.slice(2)}`;
    }
  } 
  else if(cleaned.length <= 2){
    formatted += ` (${cleaned})`
  }
  return formatted;
  }

}
