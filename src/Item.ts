import { User } from "./User";

export type Item = {
  id: string;
  name: string;
  exampleUrl: string;
  responsableUser: null | User;
};

export type ItemImage = {
  url: string;
  width: number;
  height: number;
};
