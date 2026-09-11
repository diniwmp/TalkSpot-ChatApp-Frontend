import { ReactNode } from "react";

export interface User{
    about: any;
    links: any;
    id:number;
    firstName:string;
    lastName:string;
    countryCode:string;
    contactNo:string;
    profileImage?:string;
    createdAt:string;
    updatedAt:string;
    status:string;
}

export interface Chat{
  contactNo: any;
  firstName: any;
  lastName: any;
  friendPhone: ReactNode;
    id:number;
    friendId:number;
    friendName:string;
    firendFirstName:string;
    lastMessage:string;
    lastTimeStamp:string;
    unreadCount:number;
    profileImage:string;
    from:User;
    to:User;
    createdAt:string;
    updatedAt:string;
    status:string;
     message:string;
    
}

export interface WSRequest{
    type:string;
    fromUserId?:number;
    toUserID?:number;
    message?:string;
}

export interface WSResponse{
    type:string;
    payload: any;
}