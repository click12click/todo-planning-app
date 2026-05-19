import { MongoClient, type Db } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let modulePromise: Promise<MongoClient> | undefined;

function getUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI 환경 변수가 설정되지 않았습니다. .env 파일 또는 호스팅 환경 변수를 확인해 주세요.",
    );
  }
  return uri;
}

function getClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!globalThis._mongoClientPromise) {
      globalThis._mongoClientPromise = new MongoClient(getUri()).connect();
    }
    return globalThis._mongoClientPromise;
  }
  if (!modulePromise) {
    modulePromise = new MongoClient(getUri()).connect();
  }
  return modulePromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db();
}
