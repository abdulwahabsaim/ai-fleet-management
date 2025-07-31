const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            // These options are often recommended but might not be strictly necessary
            // depending on your Mongoose version. Check Mongoose documentation.
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = dbConnect;