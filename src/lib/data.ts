import type { User } from './types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store to simulate a database. This will reset on server restart.
const users: Map<string, User> = new Map();

// Helper to get a random item from an array
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Function to create a new user with some random data for loan assessment simulation
const createNewUser = (id: string): User => ({
  id,
  kycStatus: 'unverified',
  loanStatus: 'none',
  creditScore: Math.floor(Math.random() * (850 - 300 + 1)) + 300, // Random score between 300-850
  annualIncome: Math.floor(Math.random() * (200000 - 30000 + 1)) + 30000, // Random income between 30k-200k
  employmentStatus: getRandomItem(['employed', 'self-employed', 'unemployed', 'student']),
});

export const addNewUser = (fullName: string, photoUrl: string): User => {
    const id = uuidv4();
    const newUser: User = {
        id,
        fullName,
        faceScanImageUri: photoUrl,
        kycStatus: 'new',
        loanStatus: 'none',
    };
    users.set(id, newUser);
    return newUser;
};

export const getOrCreateUser = (userId: string): User => {
  if (users.has(userId)) {
    return users.get(userId)!;
  }
  const newUser = createNewUser(userId);
  users.set(userId, newUser);
  return newUser;
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

// Initialize the default user
getOrCreateUser('default_user');
