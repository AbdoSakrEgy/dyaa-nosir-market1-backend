import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from "../../shared/utils/error/app.error.js";
import { hashData, compareData } from "../../shared/utils/bcrypt.js";
import { verifyRefreshToken } from "../../shared/utils/jwt.js";
import { generateOtp } from "../../shared/utils/generate.otp.js";
import { sendEmail } from "../../shared/utils/nodemailer/send.email.js";
import { template } from "../../shared/utils/nodemailer/generate.HTML2.js";
import { UserModel } from "../../DB/models/user/user.model.js";
import { RefreshTokenModel } from "../../DB/models/user/auth.model.js";
import { RoleModel } from "../../DB/models/user/role.model.js";
import { AuthProvider } from "../../shared/types/shared.types.js";
import type {
  RegisterDTO,
  LoginDTO,
  GoogleRegisterDTO,
  GoogleLoginDTO,
  VerifyEmailDTO,
  ResetPasswordDTO,
  ChangePasswordDTO,
} from "./auth.validators.js";
import type { AuthTokens } from "./auth.types.js";
import { createSession } from "./utils/create-session.js";
import { normalizePhone } from "./utils/normalize-phone.js";
import { verifyGoogleToken } from "./utils/verify-google-token.js";

const CODE_TTL_MS = 10 * 60 * 1000;

export class AuthService {
  // ============================ googleRegister ============================
  async googleRegister(data: GoogleRegisterDTO) {
    // step: verify google identity
    const googleUser = await verifyGoogleToken(data.googleToken);
    const normalizedPhone = normalizePhone(data.phone);

    // step: protect unique google id, email, and phone ownership
    const [userByGoogleId, userByEmail, userByPhone] = await Promise.all([
      UserModel.findOne({ googleId: googleUser.googleId, isActive: true }),
      UserModel.findOne({ email: googleUser.email, isActive: true }),
      UserModel.findOne({ phone: normalizedPhone, isActive: true }),
    ]);

    if (userByGoogleId) {
      throw new ConflictError("Google account is already registered");
    }

    if (userByEmail) {
      throw new ConflictError("An account already exists with this email");
    }

    if (userByPhone) {
      throw new ConflictError("This phone number is already used");
    }

    // step: create customer role account
    const customerRole = await RoleModel.findOne({
      slug: "customer",
      isActive: true,
    });
    if (!customerRole)
      throw new BadRequestError("Customer role is not configured");

    const user = await UserModel.create({
      name: googleUser.name,
      email: googleUser.email,
      phone: normalizedPhone,
      profileImage: googleUser.picture,
      roleId: customerRole._id,
      googleId: googleUser.googleId,
      authProvider: AuthProvider.google,
      isEmailConfirmed: true,
    });

    const tokens = await createSession(String(user._id), String(user.roleId));
    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        roleId: String(user.roleId),
        emailConfirmed: user.isEmailConfirmed,
      },
      ...tokens,
    };
  }

  // ============================ googleLogin ============================
  async googleLogin(data: GoogleLoginDTO) {
    // step: verify google identity
    const googleUser = await verifyGoogleToken(data.googleToken);

    // step: find google account
    const user = await UserModel.findOne({
      googleId: googleUser.googleId,
      authProvider: AuthProvider.google,
      isActive: true,
    });

    if (!user) throw new UnauthorizedError("Google account is not registered");

    // step: create auth session
    const tokens = await createSession(String(user._id), String(user.roleId));

    // step: result
    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        roleId: String(user.roleId),
        emailConfirmed: user.isEmailConfirmed,
      },
      ...tokens,
    };
  }

  // ============================ refreshToken ============================
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // step: verify refresh token
    const oldPayload = verifyRefreshToken(refreshToken);

    // step: atomically claim and revoke the stored token
    const revokedToken = await RefreshTokenModel.findOneAndUpdate(
      {
        token: refreshToken,
        revokedAt: { $exists: false },
        expiresAt: { $gt: new Date() },
      },
      { $set: { revokedAt: new Date() } },
      { new: true },
    );

    if (!revokedToken) throw new UnauthorizedError("Invalid refresh token");

    // step: create new auth session
    return createSession(oldPayload.userId, oldPayload.roleId);
  }

  // ============================ logout ============================
  async logout(refreshToken: string): Promise<void> {
    // step: find valid stored token
    const storedToken = await RefreshTokenModel.findOne({
      token: refreshToken,
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) throw new UnauthorizedError("Invalid refresh token");

    // step: revoke refresh token
    storedToken.revokedAt = new Date();
    await storedToken.save();
  }

  // ============================ me ============================
  async me(userId: string) {
    // step: find active user
    const user = await UserModel.findById(userId).lean({ getters: true });
    if (!user || !user.isActive) throw new NotFoundError("User");

    // step: result
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleId: String(user.roleId),
      emailConfirmed: user.isEmailConfirmed,
    };
  }

  // ============================ register ============================
  async register(data: RegisterDTO) {
    // step: check existing user
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) throw new ConflictError("Email already registered");

    // step: check customer role
    const customerRole = await RoleModel.findOne({
      slug: "customer",
      isActive: true,
    });
    if (!customerRole)
      throw new BadRequestError("Customer role is not configured");

    // step: generate otp code
    const verificationCode = generateOtp(6);

    // step: create user
    const user = await UserModel.create({
      ...data,
      password: await hashData(data.password),
      authProvider: AuthProvider.local,
      roleId: customerRole._id,
      emailOtp: {
        otp: await hashData(verificationCode),
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      },
    });

    // step: send otp code via email
    const { isEmailSended, info } = await sendEmail({
      to: data.email,
      subject: "Verify your email",
      html: template({
        otpCode: verificationCode,
        receiverName: data.name,
        subject: "Verify your email",
      }),
    });

    // step: create auth session
    const tokens = await createSession(String(user._id), String(user.roleId));

    // step: result
    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        roleId: String(user.roleId),
        emailConfirmed: user.isEmailConfirmed,
      },
      ...tokens,
    };
  }

  // ============================ verifyEmail ============================
  async verifyEmail(data: VerifyEmailDTO): Promise<void> {
    // step: find user with email otp
    const user = await UserModel.findOne({ email: data.email }).select(
      "+emailOtp.otp +emailOtp.expiresAt",
    );

    // step: check user and email status
    if (!user) throw new NotFoundError("User");
    if (user.isEmailConfirmed) return;

    // step: validate otp code
    const isExpired =
      !user.emailOtp?.expiresAt ||
      user.emailOtp.expiresAt.getTime() < Date.now();
    const isValid =
      user.emailOtp?.otp && (await compareData(data.code, user.emailOtp.otp));

    if (isExpired || !isValid)
      throw new BadRequestError("Invalid or expired code");

    // step: confirm email
    user.isEmailConfirmed = true;
    user.emailOtp = undefined;
    await user.save();
  }

  // ============================ resendVerificationEmail ============================
  async resendVerificationEmail(email: string): Promise<void> {
    // step: find user with email otp
    const user = await UserModel.findOne({ email }).select(
      "+emailOtp.otp +emailOtp.expiresAt",
    );

    // step: check user and email status
    if (!user) throw new NotFoundError("User");
    if (user.isEmailConfirmed)
      throw new BadRequestError("Email is already verified");

    // step: generate and save new otp code
    const code = generateOtp(6);
    user.emailOtp = {
      otp: await hashData(code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    };
    await user.save();

    // step: send otp code via email
    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: template({
        otpCode: code,
        receiverName: user.name,
        subject: "Verify your email",
      }),
    });
  }

  // ============================ login ============================
  async login(data: LoginDTO) {
    // step: find active user
    const user = await UserModel.findOne({
      email: data.email,
      isActive: true,
      authProvider: AuthProvider.local,
    }).select("+password");

    // step: validate password
    if (!user?.password || !(await compareData(data.password, user.password))) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // step: create auth session
    const tokens = await createSession(String(user._id), String(user.roleId));

    // step: result
    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        roleId: String(user.roleId),
        emailConfirmed: user.isEmailConfirmed,
      },
      ...tokens,
    };
  }

  // ============================ forgotPassword ============================
  async forgotPassword(email: string): Promise<void> {
    // step: find active user with password otp
    const user = await UserModel.findOne({
      email,
      isActive: true,
      authProvider: AuthProvider.local,
    }).select("+passwordOtp.otp +passwordOtp.expiresAt");

    // step: hide user existence
    if (!user) return;

    // step: generate and save password otp code
    const code = generateOtp(6);
    user.passwordOtp = {
      otp: await hashData(code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    };
    await user.save();

    // step: send password reset email
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: template({
        otpCode: code,
        receiverName: user.name,
        subject: "Reset your password",
      }),
    });
  }

  // ============================ resetPassword ============================
  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    // step: find active user with password otp
    const user = await UserModel.findOne({
      email: data.email,
      isActive: true,
      authProvider: AuthProvider.local,
    }).select("+passwordOtp.otp +passwordOtp.expiresAt");

    // step: check user
    if (!user) throw new BadRequestError("Invalid or expired code");

    // step: validate otp code
    const isExpired =
      !user.passwordOtp?.expiresAt ||
      user.passwordOtp.expiresAt.getTime() < Date.now();
    const isValid =
      user.passwordOtp?.otp &&
      (await compareData(data.code, user.passwordOtp.otp));

    if (isExpired || !isValid)
      throw new BadRequestError("Invalid or expired code");

    // step: update password
    user.password = await hashData(data.password);
    user.credentialsChangedAt = new Date();
    user.passwordOtp = undefined;
    await user.save();

    // step: revoke active sessions
    await RefreshTokenModel.updateMany(
      { userId: user._id, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
  }

  // ============================ changePassword ============================
  async changePassword(userId: string, data: ChangePasswordDTO): Promise<void> {
    // step: find active user with password
    const user = await UserModel.findOne({
      _id: userId,
      authProvider: AuthProvider.local,
    }).select("+password");

    // step: validate current password
    if (!user || !user.isActive) throw new NotFoundError("User");
    if (
      !user.password ||
      !(await compareData(data.currentPassword, user.password))
    ) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    // step: update password
    user.password = await hashData(data.newPassword);
    user.credentialsChangedAt = new Date();
    await user.save();

    // step: revoke active sessions
    await RefreshTokenModel.updateMany(
      { userId: user._id, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
  }
}

export const authService = new AuthService();
