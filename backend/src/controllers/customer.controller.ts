import { Request, Response } from 'express';
import Customer from '../models/Customer';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError, ApiResponse } from '../utils/apiResponse';

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Attempting to save:", req.body);
    
    const customer = await Customer.create({
      name: req.body.name,
      email: req.body.email,
      company: req.body.company,
      status: req.body.status,
      // 1. Give a default phone number if the form didn't send one
      phone: req.body.phone || "000-000-0000",
      // 2. Automatically set the last contact date to right now
      lastContactDate: new Date(),
      // 3. Bypass auth requirement
      createdBy: "60d5ecb8b392d700153ee859" 
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error: any) {
    console.error("💥 BACKEND CRASH REASON:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Get all customers with Advanced Filtering
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      statuses, 
      companies, 
      dateFrom, 
      dateTo, 
      phone, 
      email, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const query: any = {};

    // 1. General Search (Name, Email, Company)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Advanced Multi-Select Filters
    if (statuses) {
      // Split the comma-separated string into an array (e.g. "active,lead" -> ["active", "lead"])
      query.status = { $in: (statuses as string).split(',') };
    }
    if (companies) {
      query.company = { $in: (companies as string).split(',') };
    }

    // 3. Exact/Partial Match Filters
    if (phone) {
      query.phone = { $regex: phone, $options: 'i' };
    }
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }

    // 4. Date Range Filter
    if (dateFrom || dateTo) {
      query.lastContactDate = {};
      if (dateFrom) query.lastContactDate.$gte = new Date(dateFrom as string);
      if (dateTo) query.lastContactDate.$lte = new Date(dateTo as string);
    }

    // Sorting and Pagination
    const sortOptions: any = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (Number(page) - 1) * Number(limit);
    
    const customers = await Customer.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));
      
    const total = await Customer.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: customers,
      total,
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCustomerById = asyncHandler(async (req: Request, res: Response) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  res.status(200).json(new ApiResponse(200, 'Customer fetched successfully', customer));
});




// Update a customer
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });
    
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a customer
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    
    res.status(200).json({ success: true, message: "Customer deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};