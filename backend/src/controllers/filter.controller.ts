import { Request, Response } from 'express';
import SavedFilter from '../models/SavedFilter';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError, ApiResponse } from '../utils/apiResponse';

export const getSavedFilters = asyncHandler(async (req: Request, res: Response) => {
  const filters = await SavedFilter.find({ user: req.user._id }).sort('order');
  res.status(200).json(new ApiResponse(200, 'Saved filters fetched', filters));
});

export const saveFilter = asyncHandler(async (req: Request, res: Response) => {
  const count = await SavedFilter.countDocuments({ user: req.user._id });
  
  const filter = await SavedFilter.create({
    ...req.body,
    user: req.user._id,
    order: count, // Append to the bottom of the list
  });

  res.status(201).json(new ApiResponse(201, 'Filter saved successfully', filter));
});

export const deleteSavedFilter = asyncHandler(async (req: Request, res: Response) => {
  const filter = await SavedFilter.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!filter) throw new ApiError(404, 'Filter not found');
  res.status(200).json(new ApiResponse(200, 'Filter deleted successfully', null));
});

// Used for the Drag-and-Drop feature in the assessment
export const reorderFilters = asyncHandler(async (req: Request, res: Response) => {
  const { reorderedFilters } = req.body; // Array of { id, order }

  // Execute all updates concurrently
  await Promise.all(
    reorderedFilters.map((filter: { id: string; order: number }) =>
      SavedFilter.updateOne({ _id: filter.id, user: req.user._id }, { order: filter.order })
    )
  );

  res.status(200).json(new ApiResponse(200, 'Filters reordered successfully', null));
});