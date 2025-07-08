import { z } from 'zod';

export const CreateUserSchema = z.object({
  username: z.string().min(1).max(50),
  email: z.string().email(),
    password: z.string().min(8).max(100),
});

export const SigninSchema = z.object({
  email: z.string().email(),    
    password: z.string().min(8).max(100),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().default(true),
});