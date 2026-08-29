import { Query } from 'mongoose';

class APIFeatures<T> {
  query: Query<T[], T>;
  queryString: Record<string, any>;

  constructor(query: Query<T[], T>, queryString: Record<string, any>) {
    this.query = query;
    this.queryString = queryString;
  }

  search(): this {
    if (this.queryString.search) {
      this.query = this.query.find({
        $text: { $search: this.queryString.search },
      } as any);
    }
    return this;
  }

  filter(): this {
    const queryObj = { ...this.queryString };
    const excludedFields = ['search', 'sort', 'page', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    const filters: any = {};

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

    this.query = this.query.find(filters);
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
