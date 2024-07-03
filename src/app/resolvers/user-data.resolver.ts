import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { DataService } from "../services/data/data.service";
import { User } from "../../interfaces/user_interface";

export const userDataResolver: ResolveFn<Promise<User>> = async (
  route,
  state
) => {
  const service = inject(DataService);
  const result = await service.getUserData();
  return result;
};
