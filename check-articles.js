import mongoose from 'mongoose';

async function listArticles() {
  const uri = 'mongodb://semikserma:semikserma@ac-f6trjha-shard-00-00.dmkxhjw.mongodb.net:27017,ac-f6trjha-shard-00-01.dmkxhjw.mongodb.net:27017,ac-f6trjha-shard-00-02.dmkxhjw.mongodb.net:27017/test?ssl=true&authSource=admin&retryWrites=true&w=majority';
  
  try {
    await mongoose.connect(uri);
    
    // Create a generic model for the articles collection
    const Article = mongoose.model('Article', new mongoose.Schema({}, { strict: false }));
    
    const articles = await Article.find({});
    console.log(`Found ${articles.length} articles.`);
    
    articles.forEach((a, i) => {
      console.log(`Article ${i+1}: _id=${a._id}, title="${a.title}"`);
    });

  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await mongoose.disconnect();
  }
}

listArticles();
