const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function listCollections() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));

  for (const coll of collections) {
      const count = await mongoose.connection.db.collection(coll.name).countDocuments();
      console.log(`- ${coll.name}: ${count} documents`);
  }

  process.exit(0);
}

listCollections().catch(err => {
  console.error(err);
  process.exit(1);
});
