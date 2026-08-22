import bcrypt from "bcrypt";

import User from "../models/User";
import { generateAccessToken } from "../utils/jwt";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const SALT_ROUNDS = 12;

export const registerUser = async (
  input: RegisterInput
) => {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email
  });

  if (existingUser) {
    throw new Error(
      "An account with this email already exists"
    );
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    SALT_ROUNDS
  );

  const user = await User.create({
    name,
    email,
    passwordHash
  });

  const accessToken = generateAccessToken(
    user._id.toString()
  );

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    },
    accessToken
  };
};

export const loginUser = async (
  input: LoginInput
) => {
  const email = input.email.trim().toLowerCase();

  const user = await User.findOne({
    email
  }).select("+passwordHash");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(
    user._id.toString()
  );

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    },
    accessToken
  };
};

export const getUserById = async (
  userId: string
) => {
  const user = await User.findById(userId).select(
    "-passwordHash"
  );

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};