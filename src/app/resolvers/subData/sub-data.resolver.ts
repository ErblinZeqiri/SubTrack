import { ResolveFn } from '@angular/router';

export const subDataResolver: ResolveFn<boolean> = (route, state) => {
  console.log(route, state)
  return true;
};
