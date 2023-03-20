import { UseGuards, Post, Inject, Body, UsePipes, ValidationPipe, Req, Get, Controller, Param } from '@nestjs/common';
import { Routes, Services } from '../utils/consts';
// import { AuthenticateGuard } from '../utils/Guards';
// import { IConversationsService } from './conversations';
import { AuthUser } from 'src/utils/decorators';
import { User, Conversation } from '@prisma/client';
// import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { IsNumber } from 'class-validator';
import { Jwt_Auth_Guard } from '../auth/guards/jwt_auth.guard';
import { ConversationService } from './conversations.service';
import { ConversationModule } from './conversations.module';
import { userInfo } from 'os';
import { request } from 'http';
import { PrismaService } from '../prisma/prisma.service';




@Controller('conversation')
export class ConversationController {
	constructor (
		private readonly conversationsService: ConversationService,
		private readonly userService: UserService) {}


	@UseGuards(Jwt_Auth_Guard)
	@Post('create')
	async createConversation(
		@Req()
		req : any,
		@Body() userContent: {
			name?: string;
			chat?: boolean;
			public?: boolean;
			password?: boolean;
			request?: boolean;
			participants: string[],
			created_at?: Date
		})
		{
			console.log("USERCONTENT" + userContent.participants);
			
			if (typeof userContent.participants === "undefined")
				return null;
			let array : number[] = [];
			let user : User;
			for (let i = 0; i < userContent.participants.length; ++i)
			{
				let chat_member: number = Number(userContent.participants[i])
				user = await this.userService.findUserById(chat_member);
				if(user)
					array.push(chat_member);
			}
			
			let newConversation : Conversation = await this.conversationsService.createConversation({
				conversation_name: userContent.name,
				conversation_participant_arr: array,
				conversation_owner_arr: [Number(req.user.id)],
				conversation_admin_arr: [Number(req.user.id)],
			})
			
			for (let i = 0; i < array.length; ++i)
			{
				user = await this.userService.findUserById(array[i]);
				console.log("CONVERSATION_ID_ARR = " + user.conversation_id_arr);
				await user.conversation_id_arr.push(newConversation.conversation_id);
				await this.userService.updateUser({
					where: {
						id: array[i],
					},
					data: {
						conversation_id_arr: user.conversation_id_arr,
					}
				})	
			}
			return newConversation;
		}

		@UseGuards(Jwt_Auth_Guard)
		@Post('join_group_chat/:chat_id')
		async joinConversation(
			@Req() req: any,	
			@Body() userContent: {
				conversation_id_arr: number,
				password: string
			}
		): Promise<User> {
			console.log(userContent);
			const conversationId = userContent.conversation_id_arr;
			const existingConversation = await this.conversationsService.findConversation(userContent.conversation_id_arr)
			if (!existingConversation) return null;
			const userIdx = existingConversation.conversation_participant_arr.indexOf(req.user.id);		//is he already part of the chat
			if (userIdx > 0) return null;				// this means he is already part of the chat and i dont want to add him again
			await this.conversationsService.updateConversation({
				where: {
					conversation_id: Number(userContent.conversation_id_arr)
				},
				data: {
					conversation_participant_arr: {
						push: Number(req.user.id)
					}
				}
			}) 
			const updatedUser = await this.userService.updateUser({
				where: {
					id : Number(req.user.id)
				},
				data: {         
					conversation_id_arr: {
						push: Number(userContent.conversation_id_arr)
					}
				}
			})
			return updatedUser
		} 

		@UseGuards(Jwt_Auth_Guard)
		@Get('getMyChats')
		async getMyConversations(
			@Req() req: any,
		) {
			console.log();
			
			return this.conversationsService.findAllConversationsByUser(req.user.id);
		}

		@UseGuards(Jwt_Auth_Guard)
    	@Get('/get_messages_from_conversation/:conversationID')
    	getMsgsFromConversation(@AuthUser() user: User, @Param('conversationID') conversationId: number,)
		{
    	    return this.conversationsService.getMsgsByConversationID(conversationId)
		}


		@UseGuards(Jwt_Auth_Guard)
		@Get('getConversationById/:conversation_id')
		async getConversation(
			@Param('conversation_id') conversation_id
		) {
			console.log();
			
			return this.conversationsService.findConversation(conversation_id);
		}

		@UseGuards(Jwt_Auth_Guard)
		@Get('getConversations')
		async getConversations(): Promise<Conversation[]> {
			return this.conversationsService.getConversations({});
		}

		@UseGuards(Jwt_Auth_Guard)
		@Get('getAllChatsWithoutUser')
		async getConversationsWithoutCurrUser(
			@Req() req: any,
		) {
			return this.conversationsService.getChatsUserNotPartOf(req.user.id);
		}
}




// // @UseGuards(AuthenticateGuard)
// @Controller(Routes.CONVERSATIONS)

// export class ConversationController {

// 	constructor(
// 		@Inject(Services.CONVERSATIONS) private readonly conversationsService: IConversationsService,
// 		// @Inject(Services.USERS) private readonly UserService: UserService, 
// 		) {

// 	}

// 	@UseGuards(Jwt_Auth_Guard)
// 	@Post()
// 	async createConversation(@Req() _req: any,
// 		@AuthUser() user: User,
// 		@Body() createConversationPayload: CreateConversationDto) { 
// 			console.log("USER = " + user);
// 			console.log("USERfrom request = " + _req.user.id);
// 			console.log(createConversationPayload);
			
// 			this.conversationsService.createConversation(user, createConversationPayload)
// 			// console.log("USER " + user.name);
// 		// if (!user || !user.id)
// 		// 	throw new Error("Invalid user ID")
// 		// try {
// 		// 	const userDB = await this.UserService.findUserById(user.id)
// 		// 	console.log(userDB);    
// 			// this.conversationsService.createConversation(user, createConversationPayload);
// 			// this.conversationsService.createConversation(createConversationPayload);
// 		// }
// 		// catch( err )
// 		// {
// 		// 	console.log(err);
// 		// 	throw new Error('An error occurred while creating a conversation');
// 		// }   
// 	} 
// 	@Get()
// 	getConversations() {
// 		return this.ConversationsService.find()
// 	}