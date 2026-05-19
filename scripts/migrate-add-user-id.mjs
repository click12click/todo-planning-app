import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI 가 설정되지 않았습니다. .env 를 확인하세요.");
  process.exit(1);
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db();
  const result = await db
    .collection("tasks")
    .updateMany(
      { userId: { $exists: false } },
      { $set: { userId: null } },
    );
  console.log(
    `migrate-add-user-id: matched=${result.matchedCount} modified=${result.modifiedCount}`,
  );
} finally {
  await client.close();
}
