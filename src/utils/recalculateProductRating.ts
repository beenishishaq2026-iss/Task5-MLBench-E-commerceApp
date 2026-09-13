import Product from '@/models/Product';
import Review from '@/models/Review';
import { Types } from 'mongoose';

export async function recalculateProductRating(productId: Types.ObjectId | string) {
  const stats = await Review.aggregate([
    { $match: { product: new Types.ObjectId(productId.toString()) } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  const ratingsAverage = stats[0]?.avgRating ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const numReviews = stats[0]?.numReviews || 0;

  await Product.findByIdAndUpdate(productId, { ratingsAverage, numReviews });
}