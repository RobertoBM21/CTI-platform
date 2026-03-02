import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | undefined;

export async function startMemoryMongo(): Promise<string> {
  mongod = await MongoMemoryServer.create();
  return mongod.getUri();
}

export async function stopMemoryMongo(): Promise<void> {
  if (mongod) {
    await mongod.stop();
    mongod = undefined;
  }
}
