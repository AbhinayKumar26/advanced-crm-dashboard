import { Request, Response } from 'express';
import Customer from '../models/Customer';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError, ApiResponse } from '../utils/apiResponse';

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await Customer.create({
    ...req.body,
    accountOwner: req.user._id, // Attach the logged-in user to this customer
  });

  res.status(201).json(new ApiResponse(201, 'Customer created successfully', customer));
});

export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = '1', 
    limit = '10', 
    search, 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    status,
    company
  } = req.query;

  // 1. Build the query object
  const query: any = {};

  // Global Search (Name, Email, or Company)
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  // Exact Match Filters
  if (status) {
    query.status = { $in: (status as string).split(',') }; // Supports multiple e.g., "active,lead"
  }
  if (company) {
    query.company = { $in: (company as string).split(',') };
  }

  // 2. Pagination Math
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  // 3. Sorting logic
  const sortStage: any = {};
  sortStage[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  // 4. Execute Queries in parallel for performance
  const [customers, total] = await Promise.all([
    Customer.find(query).sort(sortStage).skip(skip).limit(limitNum),
    Customer.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Customers fetched successfully', customers, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    })
  );
});

export const getCustomerById = asyncHandler(async (req: Request, res: Response) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  res.status(200).json(new ApiResponse(200, 'Customer fetched successfully', customer));
});

export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true } // new: true returns the updated document
  );

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  res.status(200).json(new ApiResponse(200, 'Customer updated successfully', customer));
});

export const deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  res.status(200).json(new ApiResponse(200, 'Customer deleted successfully', null));
});