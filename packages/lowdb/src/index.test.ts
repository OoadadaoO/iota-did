import { LowDB } from ".";

const filename = "./db/test.db";
const password = "MySuperSecretPassword";

type Data = {
  users: { id: number; name: string }[];
  posts: { id: number; title: string }[];
};

const db = new LowDB<Data>(
  {
    filename,
    password,
  },
  {
    users: [],
    posts: [],
  },
);
console.log(db.data);

await db.update((data) => {
  data.users = data.users || [];
  data.users.push({ id: 1, name: "John Doe" });
  return data;
});
console.log(db.data);
