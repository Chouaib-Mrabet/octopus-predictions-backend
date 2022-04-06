import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from 'mongoose';
import {User,UserDocument} from 'src/schemas/user.schema'

@Injectable()
export class AuthService {

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {

  }


  hello(){
    return 'hello from auth'
  }


  
}

