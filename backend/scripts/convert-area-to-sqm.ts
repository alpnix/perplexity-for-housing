import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { House } from '../src/models/house.model';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

// Conversion factor: 1 square foot = 0.092903 square meters
const SQFT_TO_SQM_CONVERSION_FACTOR = 0.092903;

async function convertAreaToSquareMeters() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to MongoDB Atlas');

    // Find all houses with Area field
    console.log('Fetching houses from database...');
    const houses = await House.find({ Area: { $exists: true, $ne: null } }).lean();
    
    console.log(`Found ${houses.length} houses with area data`);

    if (houses.length === 0) {
      console.log('No houses found with area data. Exiting...');
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    // Process each house
    for (const house of houses) {
      const currentArea = house.Area;
      
      // Skip if area is null, undefined, or not a number
      if (!currentArea || typeof currentArea !== 'number' || currentArea <= 0) {
        console.log(`Skipping house ${house._id}: Invalid area value (${currentArea})`);
        skippedCount++;
        continue;
      }

      // Convert square feet to square meters
      const areaInSquareMeters = Math.round(currentArea * SQFT_TO_SQM_CONVERSION_FACTOR * 100) / 100; // Round to 2 decimal places

      console.log(`House ${house._id}: ${currentArea} sq ft → ${areaInSquareMeters} sq m`);

      // Update the house in the database
      await House.updateOne(
        { _id: house._id },
        { $set: { Area: areaInSquareMeters } }
      );

      updatedCount++;
    }

    console.log('\n=== Conversion Summary ===');
    console.log(`Total houses processed: ${houses.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Skipped (invalid data): ${skippedCount}`);
    console.log('Area conversion completed successfully!');

  } catch (error) {
    console.error('Error during area conversion:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
}

// Run the script
if (require.main === module) {
  convertAreaToSquareMeters()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { convertAreaToSquareMeters };
