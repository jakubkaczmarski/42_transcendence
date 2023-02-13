import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from 'passport-42';
import { AuthService } from "../auth.service";
import { Injectable } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";

@Injectable()
export class Intra42Strategy extends PassportStrategy(Strategy, '42'){
	constructor(private authService: AuthService) 
	{
		super({
			clientID: "u-s4t2ud-ebe5af0f2962dca5114adf05b60c69a7cbbb6ec31e4cd146812b74d954feb284",
			clientSecret: "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",
			callbackURL: "http://localhost:3000/auth/login",
		});
	}

	async	validate(
		accessToken: string,
		refreshToken: string,
		profile: Profile,
		done: VerifyCallback,
	) : Promise<User | undefined>
	{
		// console.log(accessToken);
		// console.log(refreshToken);
		// console.log(profile.username);
		// console.log(profile.id);
		// console.log(profile.emails[0]);
		const user = await this.authService.validateUser(profile.id, profile.username, profile.emails[0].value);
		return (user);
	}



}
