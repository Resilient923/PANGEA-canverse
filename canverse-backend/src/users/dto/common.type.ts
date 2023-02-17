export interface UserType {
  _id?: string;
  name: string;
  profile_img_path: string;
  email: string;
}
export interface ProductInfoType {
  reserve_price?: number;
  reserve_price2?: number;
  currency?: string;
  currency2?: string;
  thumb_img_path: string;
  title: string;
  _id?: string;
  user_likes: number;
}
export interface ProductsType {
  product: ProductInfoType;
  creator: UserType;
  owner?: UserType;
  likedByUser: boolean;
}
