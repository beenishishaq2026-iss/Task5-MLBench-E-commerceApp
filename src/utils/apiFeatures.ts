import { Query } from 'mongoose';
import { escapeRegex } from './escapeRegex';

type QueryString = Record<string, string>;

interface ProductFilters {
  category?: string | { $in: string[] };
  brand?: string;
  price?: { $gte?: number; $lte?: number };
  stock?: { $gt: number };
  isFeatured?: boolean;
}

class APIFeatures<T> {
  query: Query<T[], T>;
  queryString: QueryString;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search(): this {
    const term = this.queryString.search?.trim();
    if (term) {
      // Case-insensitive partial match across name/brand/description so
      // results start appearing as soon as the user types a few
      // characters (type-ahead), rather than requiring a full whole-word
      // match the way MongoDB's $text search does.
      const regex = new RegExp(escapeRegex(term), 'i');
      this.query = this.query.find({
        $or: [{ name: regex }, { brand: regex }, { description: regex }],
      } as Record<string, unknown>);
    }
    return this;
  }

  filter(): this {
    const queryObj = { ...this.queryString };
    const excludedFields = ['search', 'sort', 'page', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    const filters: ProductFilters = {};

    if (queryObj.category) {
      const categoryIds = queryObj.category
        .split(',')
        .map((id: string) => id.trim())
        .filter(Boolean);
      filters.category = categoryIds.length > 1 ? { $in: categoryIds } : categoryIds[0];
    }

    if (queryObj.brand) {
      filters.brand = queryObj.brand;
    }

    if (queryObj.minPrice || queryObj.maxPrice) {
      filters.price = {};
      if (queryObj.minPrice) filters.price.$gte = Number(queryObj.minPrice);
      if (queryObj.maxPrice) filters.price.$lte = Number(queryObj.maxPrice);
    }

    if (queryObj.inStock === 'true') {
      filters.stock = { $gt: 0 };
    }

    if (queryObj.isFeatured === 'true') {
      filters.isFeatured = true;
    }

    this.query = this.query.find(filters as Record<string, unknown>);
    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate(): this {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 12;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;