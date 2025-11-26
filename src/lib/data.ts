import type { User } from './types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store to simulate a database. This will reset on server restart.
const users: Map<string, User> = new Map();

// Helper to get a random item from an array
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const addNewUser = (fullName: string, secretKey: string): User => {
    const id = uuidv4();
    const newUser: User = {
        id,
        fullName,
        secretKey,
        kycStatus: 'approved', // Auto-approved since we removed KYC flow
        loanStatus: 'none',
        creditScore: Math.floor(Math.random() * (850 - 300 + 1)) + 300,
        annualIncome: Math.floor(Math.random() * (200000 - 30000 + 1)) + 30000,
        employmentStatus: getRandomItem(['employed', 'self-employed', 'unemployed', 'student']),
    };
    users.set(id, newUser);
    return newUser;
};

export const findUserByCredentials = (fullName: string, secretKey: string): User | undefined => {
    for (const user of users.values()) {
        if (user.fullName === fullName && user.secretKey === secretKey) {
            return user;
        }
    }
    return undefined;
};


export const getUser = (userId: string): User | undefined => {
  return users.get(userId);
};

export const updateUser = (userId: string, data: Partial<User>): User => {
  const user = users.get(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const updatedUser = { ...user, ...data };
  users.set(userId, updatedUser);
  return updatedUser;
};

export const getAllUsers = (): User[] => {
  return Array.from(users.values());
};

// Pre-create a user for demo purposes
addNewUser('Jane Doe', '1234');
