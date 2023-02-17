import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Inject,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessToken } from './passport/types';
import { ReqUser } from 'src/common/decorator';
import { User } from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { LoginWithEmailDto } from './dto/login-with-email.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import {
  VerifyPhoneRequestDto,
  VerifyPhoneValidateDto,
} from './dto/verify-phone.dto';
import {
  ResetPasswordRequestDto,
  ResetPasswordUpdateDto,
  ResetPasswordTokenExistsDto,
} from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SignupWithEmailDto } from './dto/signup-with-email.dto';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { OptionalJwtGuard } from './optional.jwt.guard';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: Logger,
  ) {}

  // @ApiOperation({ summary: 'Create user with eamil ' })
  // @Post('signup')
  // async signUp(@Body() params: CreateUserDto): Promise<AccessToken> {
  //   const user = await this.usersService.signUp(CreateUserDto);
  //   return user;
  // }

  @ApiOperation({ summary: 'Login user with google' })
  @Post(`/auth/google`)
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Body() params: GoogleAuthDto): Promise<AccessToken> {
    this.logger.log(`googleAuth:${params}`);
    const token = await this.usersService.googleAuth(params);
    this.logger.log(token);
    return token;
  }

  // @ApiOperation({ summary: 'Login user with kakao' })
  // @Post(`/auth/kakao`)
  // @UseGuards(AuthGuard('kakao'))
  // async kakaoAuth(@Body() params: KakaoLoginDto): Promise<AccessToken> {
  //   return this.usersService.kakaoLogin(params);
  // }

  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Log in with email' })
  @Post('/login')
  @ApiBody({ type: LoginWithEmailDto })
  async loginWithEmail(@ReqUser() user: User): Promise<AccessToken> {
    this.logger.log(`login:${user}`);
    const token = this.usersService.getAccessToken(user);
    this.logger.log(token);
    return token;
  }

  @Post('/signup')
  @ApiOperation({ summary: 'Sign up with email' })
  @ApiBody({ type: SignupWithEmailDto })
  async signupWithEmail(
    @Body() body: SignupWithEmailDto,
  ): Promise<AccessToken> {
    const user = await this.usersService.create(body);
    return this.usersService.getAccessToken(user);
  }

  @ApiOperation({ summary: 'Retreive my account info.' })
  @ApiBearerAuth('jwt')
  @Get(`/me`)
  @UseGuards(AuthGuard('jwt'))
  async me(@ReqUser() user: User): Promise<User> | null {
    console.log('User:', user);
    return user;
  }

  @Post('/update-wallet')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update user wallet' })
  async updateWallet(
    @ReqUser() user: User,
    @Body() params: UpdateWalletDto,
  ): Promise<User> | null {
    return this.usersService.updateWallet(user, params);
  }

  @ApiOperation({ summary: 'Update user profile' })
  @Patch('profile')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  async updateUserProfile(
    @ReqUser() user: User,
    @Body() params: UpdateUserProfileDto,
  ) {
    return this.usersService.updateUserProfile(user, params);
  }

  @ApiOperation({ summary: ' Update user info' })
  @Patch('info')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  async updateUserInfo(
    @ReqUser() user: User,
    @Body() params: UpdateUserInfoDto,
  ) {
    return this.usersService.updateUserInfo(user, params);
  }
  // @ApiOperation({ summary: ' Get created products by userId' })
  // @ApiBearerAuth('jwt')
  // @UseGuards(AuthGuard('jwt'))
  // @Get('createdproducts')
  // async getCreatedProducts(@ReqUser() user: User) {
  //   return this.usersService.getCreatedProducts(user);
  // }

  @ApiOperation({ summary: ' Get collected products by userId' })
  @UseGuards(OptionalJwtGuard)
  @Get(':id/collected_products')
  async getCollectedProducts(
    @Param('id') userId: string,
    @ReqUser() user: User | null,
  ) {
    return this.usersService.getCollectedProducts(userId, user);
  }

  @ApiOperation({ summary: ' Get created products by userId' })
  @UseGuards(OptionalJwtGuard)
  @Get(':id/created_products')
  async getCreatedProducts(
    @Param('id') userId: string,
    @ReqUser() user: User | null,
  ) {
    return this.usersService.getCreatedProducts(userId, user);
  }

  @Post('/update-password')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update password' })
  async updatePassword(@ReqUser() user: User, @Body() body: UpdatePasswordDto) {
    return this.usersService.updatePassword(user, body);
  }

  // Send verification SMS
  @Post('/verify-phone/request')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Send verification SMS to a user' })
  async verifyPhoneRequest(
    @ReqUser() user: User,
    @Body() params: VerifyPhoneRequestDto,
  ) {
    return this.usersService.verifyPhoneRequest(user, params);
  }

  // Send verification SMS
  @Post('/verify-phone/validate')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Validate SMS verification code' })
  async verifyPhoneValidate(
    @ReqUser() user: User,
    @Body() params: VerifyPhoneValidateDto,
  ) {
    return this.usersService.verifyPhoneValidate(user, params);
  }
  @ApiOperation({ summary: 'Test API to get some users' })
  @Get('/test')
  async test() {
    this.logger.debug('This is a sample log message, debug level');
    //const models = this.usersService.findAll();
    //this.logger.log('This is a sample log message, log(info) level', models);
    this.logger.error('This is a sample log message, error level');
    //return models;
    return {};
  }

  // @ApiOperation({ summary: ' Update profile img' })
  // @Put(':id/updateprofileimg')
  // async updateProfileImg(
  //   @Param('id') userId: string,
  //   @Body() param: UpdateProfileImgDto,
  // ) {
  //   return this.usersService.updateProfileImg();
  // }

  // @ApiOperation({ summary: 'Update user address' })
  // @Put(':id/address')
  // async updateAddress(@Param('id') userId: string, @Body() param: AddressId){
  //   return this.usersService.updateAddress();
  // }

  @Post('/reset-password/request')
  @ApiOperation({ summary: 'Request to send a link to reset password' })
  async resetPasswordRequest(@Body() params: ResetPasswordRequestDto) {
    return this.usersService.resetPasswordRequest(params);
  }

  @Get('/reset-password/exists/:token')
  @ApiOperation({ summary: 'Check if the token to reset password exists' })
  async resetPasswordTokenExists(@Param('token') token: string) {
    const tokenObj = await this.usersService.resetPasswordTokenExists(token);
    return tokenObj !== null;
  }

  // TODO: This endpoint has some similarities with update password endpoint.
  // Can they be merged into one?
  @Post('/reset-password/update')
  @ApiOperation({ summary: 'Reset password with a new one' })
  async resetPasswordUpdate(@Body() body: ResetPasswordUpdateDto) {
    return this.usersService.resetPasswordUpdate(body);
  }

  @ApiOperation({ summary: ' Get user profile' })
  @Get('/profile')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@ReqUser() user: User) {
    return this.usersService.getProfile(user);
  }

  @ApiOperation({ summary: ' Get basic user info' })
  @Get(':id')
  async get(@Param('id') userId: string) {
    return this.usersService.getPublicInfo(userId);
  }
}
